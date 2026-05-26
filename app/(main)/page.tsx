import { HeroSection } from "@/components/home/hero-section";
import { ProgramSection } from "@/components/home/program-section";
import { RsvpForm } from "@/components/rsvp/rsvp-form";
import { getInviteById } from "@/lib/google/guests";
import { getSiteSettings } from "@/lib/google/settings";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: { guestId?: string };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const guestId = searchParams.guestId?.trim();
  const [settings, invite] = await Promise.all([
    getSiteSettings(),
    guestId ? getInviteById(guestId) : Promise.resolve(null),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16">
      <HeroSection guestName={invite?.inviteName} settings={settings} />
      <div className="space-y-16">
        <ProgramSection settings={settings} />
        <RsvpForm
          guestId={invite?.id ?? guestId}
          initialName={invite?.inviteName}
          people={invite?.people}
          description={settings.rsvpDescription}
        />
      </div>
    </div>
  );
}
