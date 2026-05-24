/**
 * Webhook: генерация AI-фона → Google Drive → bg_url в листе Guests.
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
  const secret = process.env.GENERATE_BG_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "GENERATE_BG_WEBHOOK_SECRET не настроен" },
      { status: 503 },
    );
  }

  if (request.headers.get("x-webhook-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let guestId: string;
  try {
    const body = (await request.json()) as { guestId?: string };
    guestId = body.guestId?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!guestId) {
    return NextResponse.json({ error: "guestId required" }, { status: 400 });
  }

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
      { error: "OPENAI_API_KEY не настроен" },
      { status: 503 },
    );
  }

  try {
    await updateGuestBackground(guest.id, "", "pending");

    const bgUrl = await generateAndUploadInviteBackground(
      guest.id,
      guest.name,
      openaiKey,
    );

    await updateGuestBackground(guest.id, bgUrl, "done");

    return NextResponse.json({
      ok: true,
      guestId: guest.id,
      bgUrl,
    });
  } catch (error) {
    console.error("[generate-invite-bg]", error);
    await updateGuestBackground(guest.id, "", "error").catch(() => {});
    return NextResponse.json(
      {
        error: "Generation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
