import { renderInviteOgImage } from "@/app/api/og/invite/og-image";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface InviteOgImageRouteProps {
  params: { id: string };
}

function decodeOgImageName(value: string) {
  try {
    const versionlessValue = decodeURIComponent(value).replace(/^v\d+-/, "");
    const base64 = versionlessValue.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const bytes = Uint8Array.from(atob(paddedBase64), function (character) {
      return character.charCodeAt(0);
    });

    return new TextDecoder().decode(bytes).trim() || "дорогих гостей";
  } catch {
    return "дорогих гостей";
  }
}

export async function GET(_request: Request, { params }: InviteOgImageRouteProps) {
  return renderInviteOgImage({ inviteName: decodeOgImageName(params.id) });
}
