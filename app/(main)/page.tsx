import { DressCodeSection } from "@/components/home/dress-code-section";
import { FinalRings } from "@/components/home/final-rings";
import { HeroSection } from "@/components/home/hero-section";
import { ProgramSection } from "@/components/home/program-section";
import { WishWallSection } from "@/components/home/wish-wall-section";
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
    <div className="overflow-hidden bg-[#fdfbf7]">
      <HeroSection guestName={invite?.inviteName} settings={settings} />
      <ProgramSection settings={settings} />
      <DressCodeSection />
      <WishWallSection />
      <section className="px-3 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#8a9a7a]/15 bg-white/70 p-3 shadow-[0_18px_55px_rgba(52,49,45,0.07)] backdrop-blur-sm sm:rounded-[2rem] sm:p-8 sm:shadow-[0_24px_80px_rgba(52,49,45,0.08)]">
          <RsvpForm
            guestId={invite?.id ?? guestId}
            initialName={invite?.inviteName}
            people={invite?.people}
            description={settings.rsvpDescription}
          />
        </div>
      </section>
      <FinalRings settings={settings} />
    </div>
  );
}
