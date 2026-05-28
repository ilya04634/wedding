import { PersonalInvite } from "@/components/invite/personal-invite";
import { getInviteById } from "@/lib/google/guests";
import { getSiteSettings } from "@/lib/google/settings";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface InvitePageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: InvitePageProps): Promise<Metadata> {
  const invite = await getInviteById(params.id);
  if (!invite) return { title: "Приглашение" };
  const title = `Приглашение для ${invite.inviteName}`;

  return {
    title,
    description: title,
    openGraph: {
      title,
      description: title,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description: title,
    },
  };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const [invite, settings] = await Promise.all([
    getInviteById(params.id),
    getSiteSettings(),
  ]);

  if (!invite) {
    notFound();
  }

  return <PersonalInvite invite={invite} settings={settings} />;
}
