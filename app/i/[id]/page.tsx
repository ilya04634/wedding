import { PersonalInvite } from "@/components/invite/personal-invite";
import { getInviteById } from "@/lib/google/guests";
import { getSiteSettings } from "@/lib/google/settings";
import { toAccusativeInviteName } from "@/lib/invite/russian-accusative";
import { getSiteUrl } from "@/lib/invite/url";
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
  const previewName = toAccusativeInviteName(invite.inviteName);
  const title = `Приглашаем ${previewName}`;
  const description = `Илья и Дарья приглашают ${previewName} на свадьбу`;
  const siteUrl = getSiteUrl();
  const inviteUrl = `${siteUrl}/i/${encodeURIComponent(params.id)}`;
  const imageUrl = `${siteUrl}/api/og/invite?name=${encodeURIComponent(
    invite.inviteName,
  )}&v=3`;

  return {
    title,
    description,
    alternates: {
      canonical: inviteUrl,
    },
    openGraph: {
      title,
      description,
      url: inviteUrl,
      siteName: "Свадьба Дарьи и Ильи",
      type: "website",
      locale: "ru_RU",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
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
