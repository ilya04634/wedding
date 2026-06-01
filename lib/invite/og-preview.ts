import { toAccusativeInviteName } from "@/lib/invite/russian-accusative";
import { getSiteUrl } from "@/lib/invite/url";

export function getInvitePreviewName(invite: {
  inviteName: string;
  noDeclension?: boolean;
}) {
  return invite.noDeclension
    ? invite.inviteName
    : toAccusativeInviteName(invite.inviteName);
}

export function encodeInviteOgImageName(value: string) {
  return Buffer.from(value.trim() || "guest", "utf8").toString("base64url");
}

export function buildInviteOgImageUrl(previewName: string) {
  return `${getSiteUrl()}/api/og/invite-image/${encodeInviteOgImageName(
    previewName,
  )}/image.png`;
}

export async function warmInviteOgImage(previewName: string) {
  const imageUrl = buildInviteOgImageUrl(previewName);

  try {
    const response = await fetch(imageUrl, {
      headers: {
        "user-agent": "wedding-invite-og-warmer",
      },
    });

    if (!response.ok) {
      console.warn("[invite-og] warmup failed", {
        imageUrl,
        status: response.status,
      });
    }
  } catch (error) {
    console.warn("[invite-og] warmup failed", { imageUrl, error });
  }

  return imageUrl;
}
