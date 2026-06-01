import { getInviteById } from "@/lib/google/guests";
import { toAccusativeInviteName } from "@/lib/invite/russian-accusative";
import { renderInviteOgImage } from "@/app/api/og/invite/og-image";

export const dynamic = "force-dynamic";

interface InviteOgImageRouteProps {
  params: { id: string };
}

export async function GET(_request: Request, { params }: InviteOgImageRouteProps) {
  const invite = await getInviteById(params.id);
  const inviteName = invite
    ? invite.noDeclension
      ? invite.inviteName
      : toAccusativeInviteName(invite.inviteName)
    : "дорогих гостей";

  return renderInviteOgImage({ inviteName });
}
