import { NextRequest } from "next/server";
import { toAccusativeInviteName } from "@/lib/invite/russian-accusative";
import { renderInviteOgImage } from "./og-image";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawName = searchParams.get("name")?.trim();
  const shouldDecline = searchParams.get("decline") !== "0";
  const inviteName = rawName
    ? shouldDecline
      ? toAccusativeInviteName(rawName)
      : rawName
    : "дорогих гостей";

  return renderInviteOgImage({ inviteName });
}
