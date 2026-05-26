import { HeroSection } from "@/components/home/hero-section";
import { ProgramSection } from "@/components/home/program-section";
import { RsvpForm } from "@/components/rsvp/rsvp-form";
import { getInviteById } from "@/lib/google/guests";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: { guestId?: string };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const guestId = searchParams.guestId?.trim();
  const invite = guestId ? await getInviteById(guestId) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16">
      <HeroSection guestName={invite?.inviteName} />
      <div className="space-y-16">
        <ProgramSection />
        <RsvpForm
          guestId={invite?.id ?? guestId}
          initialName={invite?.inviteName}
        />
      </div>
    </div>
  );
}
