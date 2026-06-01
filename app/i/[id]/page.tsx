import { PersonalInvite } from "@/components/invite/personal-invite";
import { getInviteById } from "@/lib/google/guests";
import { getSiteSettings } from "@/lib/google/settings";
import {
  buildInviteOgImageUrl,
  getInvitePreviewName,
} from "@/lib/invite/og-preview";
import { buildPublicInviteUrl } from "@/lib/invite/url";
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
  const previewName = getInvitePreviewName(invite);
  const title = `Приглашаем ${previewName}`;
  const description = `Илья и Дарья приглашают ${previewName} на свадьбу`;
  const inviteUrl = buildPublicInviteUrl(params.id);
  const imageUrl = buildInviteOgImageUrl(previewName);

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
      siteName: "Свадьба Ильи и Дарьи",
      type: "website",
      locale: "ru_RU",
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          width: 1200,
          height: 630,
          type: "image/png",
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
