import { renderInviteOgImage } from "@/app/api/og/invite/og-image";

export const dynamic = "force-dynamic";

interface InviteOgImageRouteProps {
  params: { id: string };
}

function decodeOgImageName(value: string) {
  try {
    return (
      Buffer.from(decodeURIComponent(value), "base64url")
        .toString("utf8")
        .trim() || "дорогих гостей"
    );
  } catch {
    return "дорогих гостей";
  }
}

export async function GET(_request: Request, { params }: InviteOgImageRouteProps) {
  return renderInviteOgImage({ inviteName: decodeOgImageName(params.id) });
}
