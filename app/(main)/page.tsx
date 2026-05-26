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
      <section className="px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#8a9a7a]/15 bg-white/70 p-5 shadow-[0_24px_80px_rgba(52,49,45,0.08)] backdrop-blur-sm sm:p-8">
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
