import { HeroSection } from "@/components/home/hero-section";
import { ProgramSection } from "@/components/home/program-section";
import { RsvpForm } from "@/components/rsvp/rsvp-form";
import { getGuestById } from "@/lib/google/guests";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: { guestId?: string };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const guestId = searchParams.guestId?.trim();
  const guest = guestId ? await getGuestById(guestId) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16">
      <HeroSection guestName={guest?.name} />
      <div className="space-y-16">
        <ProgramSection />
        <RsvpForm
          guestId={guest?.id ?? guestId}
          initialName={guest?.name}
        />
      </div>
    </div>
  );
}
