/**
 * Webhook: generate AI invite background, upload it to Google Drive,
 * and write the resulting public URL to the Guests sheet.
 *
 * POST { "guestId": "ivan" }
 * Header: x-webhook-secret: <GENERATE_BG_WEBHOOK_SECRET>
 */

import { getGuestById, updateGuestBackground } from "@/lib/google/guests";
import { generateAndUploadInviteBackground } from "@/lib/invite/generate-background";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  let stage = "init";

  const secret = process.env.GENERATE_BG_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "GENERATE_BG_WEBHOOK_SECRET is not configured" },
      { status: 503 },
    );
  }

  if (request.headers.get("x-webhook-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let guestId: string;
  try {
    stage = "parse-request";
    const body = (await request.json()) as { guestId?: string };
    guestId = body.guestId?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!guestId) {
    return NextResponse.json({ error: "guestId required" }, { status: 400 });
  }

  stage = "get-guest";
  const guest = await getGuestById(guestId);
  if (!guest) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }

  if (guest.bgUrl && guest.status === "done") {
    return NextResponse.json({
      ok: true,
      guestId: guest.id,
      bgUrl: guest.bgUrl,
      skipped: true,
    });
  }

  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (!openaiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured" },
      { status: 503 },
    );
  }

  try {
    stage = "sheet-update-pending";
    console.log("[generate-invite-bg] stage", stage, { guestId: guest.id });
    await updateGuestBackground(guest.id, "", "pending");

    stage = "openai-generate-and-drive-upload";
    console.log("[generate-invite-bg] stage", stage, { guestId: guest.id });
    const bgUrl = await generateAndUploadInviteBackground(
      guest.id,
      guest.name,
      openaiKey,
    );

    stage = "sheet-update-done";
    console.log("[generate-invite-bg] stage", stage, { guestId: guest.id });
    await updateGuestBackground(guest.id, bgUrl, "done");

    return NextResponse.json({
      ok: true,
      guestId: guest.id,
      bgUrl,
    });
  } catch (error) {
    console.error("[generate-invite-bg]", { stage, error });
    await updateGuestBackground(guest.id, "", "error").catch(() => {});
    return NextResponse.json(
      {
        error: "Generation failed",
        stage,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
