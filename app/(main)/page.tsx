import { CountdownSection } from "@/components/home/countdown-section";
import { DressCodeSection } from "@/components/home/dress-code-section";
import { FinalRings } from "@/components/home/final-rings";
import { HeroSection } from "@/components/home/hero-section";
import { ProgramSection } from "@/components/home/program-section";
import { WishWallSection } from "@/components/home/wish-wall-section";
import { RsvpForm } from "@/components/rsvp/rsvp-form";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { getInviteById } from "@/lib/google/guests";
import { getSiteSettings } from "@/lib/google/settings";
import Image from "next/image";

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

  const sections = {
    countdown: <CountdownSection />,
    program: <ProgramSection settings={settings} />,
    dressCode: <DressCodeSection />,
    wishWall: (
      <WishWallSection
        guestName={invite?.inviteName}
        settings={settings}
      />
    ),
    rsvp: (
      <section
        id="rsvp"
        className="wedding-paper relative scroll-mt-24 overflow-hidden px-3 py-14 sm:px-8 sm:py-20"
      >
        <Image
          src="/wedding-design/wildflowers-wide.png"
          alt=""
          width={740}
          height={423}
          className="pointer-events-none absolute right-0 top-0 w-56 opacity-75 mix-blend-multiply sm:w-72"
        />
        <div className="paper-card relative z-10 mx-auto max-w-3xl p-3 sm:p-8">
          <RsvpForm
            guestId={invite?.id ?? guestId}
            initialName={invite?.inviteName}
            people={invite?.people}
            description={settings.rsvpDescription}
            alcoholEnabled={settings.rsvpAlcoholEnabled}
            alcoholOptions={settings.rsvpAlcoholOptions}
          />
        </div>
      </section>
    ),
    final: <FinalRings settings={settings} />,
  };
  const rendered = new Set<string>();
  const enabledSections = new Set(settings.enabledSections);
  const sectionOrder = [
    ...settings.sectionOrder,
    ...Object.keys(sections).filter((key) => !settings.sectionOrder.includes(key)),
  ];

  return (
    <div className="wedding-paper overflow-hidden">
      <HeroSection guestName={invite?.inviteName} settings={settings} />
      {sectionOrder.map((key) => {
        if (
          rendered.has(key) ||
          !(key in sections) ||
          !enabledSections.has(key)
        ) {
          return null;
        }
        rendered.add(key);
        return (
          <ScrollReveal
            key={key}
            distance={settings.revealAnimationDistance}
            mode={settings.revealAnimationMode}
            speed={settings.revealAnimationSpeed}
            trigger={settings.revealAnimationTrigger}
          >
            {sections[key as keyof typeof sections]}
          </ScrollReveal>
        );
      })}
    </div>
  );
}

