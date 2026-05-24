import { PersonalInvite } from "@/components/invite/personal-invite";
import { getGuestById } from "@/lib/google/guests";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface InvitePageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: InvitePageProps): Promise<Metadata> {
  const guest = await getGuestById(params.id);
  if (!guest) return { title: "Приглашение" };
  return {
    title: `Приглашение для ${guest.name}`,
  };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const guest = await getGuestById(params.id);

  if (!guest) {
    notFound();
  }

  return <PersonalInvite guest={guest} />;
}
