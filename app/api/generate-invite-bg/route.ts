/**
 * Webhook: generate AI invite background, upload it to Google Drive,
 * and write the resulting public URL to every row with the same invite id.
 *
 * POST { "guestId": "ivan" }
 * Header: x-webhook-secret: <GENERATE_BG_WEBHOOK_SECRET>
 */

import { getInviteById, updateInviteBackground } from "@/lib/google/guests";
import { getSiteSettings } from "@/lib/google/settings";
import { resolveInviteBackground } from "@/lib/invite/background-service";
import { getInvitePreviewName, warmInviteOgImage } from "@/lib/invite/og-preview";
import { buildPublicInviteUrl } from "@/lib/invite/url";
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

  stage = "get-invite";
  const invite = await getInviteById(guestId);
  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  const inviteUrl = buildPublicInviteUrl(invite.id);
  const previewName = getInvitePreviewName(invite);
  const settings = await getSiteSettings();
  const allowGeneration = settings.inviteBackgroundGenerationEnabled;

  if (invite.bgUrl && invite.status === "done") {
    if (invite.inviteUrl !== inviteUrl) {
      await updateInviteBackground(invite.id, invite.bgUrl, "done", inviteUrl);
    }

    await warmInviteOgImage(previewName);

    return NextResponse.json({
      ok: true,
      guestId: invite.id,
      bgUrl: invite.bgUrl,
      inviteUrl,
      people: invite.people.length,
      skipped: true,
    });
  }

  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (allowGeneration && !openaiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured" },
      { status: 503 },
    );
  }

  try {
    stage = "sheet-update-pending";
    console.log("[generate-invite-bg] stage", stage, { guestId: invite.id });
    await updateInviteBackground(invite.id, "", "pending");

    stage = !allowGeneration
      ? "background-pool-only"
      : invite.prompt?.trim()
        ? "openai-generate-and-drive-upload"
        : "pool-or-openai-generate-and-drive-upload";
    console.log("[generate-invite-bg] stage", stage, { guestId: invite.id });
    const background = await resolveInviteBackground(invite, {
      allowGeneration,
      forcePool: !allowGeneration,
      openaiApiKey: openaiKey,
    });
    const bgUrl = background.bgUrl;

    stage = "sheet-update-done";
    console.log("[generate-invite-bg] stage", stage, { guestId: invite.id });
    await updateInviteBackground(invite.id, bgUrl, "done", inviteUrl);
    await warmInviteOgImage(previewName);

    return NextResponse.json({
      ok: true,
      guestId: invite.id,
      bgUrl,
      inviteUrl,
      people: invite.people.length,
      reusedFromPool: background.reusedFromPool,
      poolBgId: background.poolBgId,
    });
  } catch (error) {
    console.error("[generate-invite-bg]", { stage, error });
    await updateInviteBackground(invite.id, "", "error").catch(() => {});
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
