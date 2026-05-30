import type { SiteSettings } from "@/types/settings";
import Image from "next/image";

interface HeroSectionProps {
  guestName?: string;
  settings: SiteSettings;
}

export function HeroSection({ guestName, settings }: HeroSectionProps) {
  const eyebrow = guestName
    ? settings.heroPersonalEyebrowTemplate.replaceAll("{{guestName}}", guestName)
    : settings.heroDefaultEyebrow;

  return (
    <section className="figma-section relative isolate min-h-[calc(100svh-57px)] overflow-hidden px-3 py-10 text-center sm:min-h-[calc(100svh-65px)] sm:px-8 sm:py-16 lg:py-20">
      <Image
        src="/wedding-design/wildflowers-wide.png"
        alt=""
        width={740}
        height={423}
        className="pointer-events-none absolute -right-14 top-14 z-0 w-44 opacity-85 mix-blend-multiply sm:-right-8 sm:top-8 sm:w-72 lg:right-2 lg:top-10 lg:w-80"
      />
      <Image
        src="/wedding-design/wildflowers-stem.png"
        alt=""
        width={600}
        height={900}
        className="pointer-events-none absolute -bottom-12 -left-16 z-0 w-44 rotate-[-14deg] opacity-65 mix-blend-multiply sm:w-64"
      />

      <div className="garden-fade relative z-10 mx-auto flex max-w-5xl flex-col items-center">
        <p className="max-w-full border-y border-[#397c57]/40 px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#397c57] sm:px-4 sm:text-xs sm:tracking-[0.22em]">
          {eyebrow}
        </p>

        <div className="mt-7 max-w-full sm:mt-8">
          <p className="font-display text-[2.45rem] font-semibold uppercase tracking-[0.2em] text-[#193726] sm:text-6xl sm:tracking-[0.28em]">
            {settings.heroFamilyName}
          </p>
          <h1 className="font-figma-script mt-1 text-balance text-[3.45rem] leading-[0.86] text-[#397c57] min-[360px]:text-[4.25rem] sm:text-8xl lg:text-9xl">
            {settings.coupleNames}
          </h1>
        </div>

        <p className="mx-auto mt-5 max-w-2xl text-balance font-display text-2xl leading-tight text-[#193726] sm:text-4xl lg:text-5xl">
          {settings.heroSubtitle}
        </p>
        <p className="mx-auto mt-5 max-w-2xl text-balance text-[0.95rem] leading-7 text-[#3d361f]/75 sm:mt-6 sm:text-lg sm:leading-8">
          {settings.heroText}
        </p>

        <a
          href="#rsvp"
          className="mt-9 inline-flex min-h-12 w-full max-w-sm items-center justify-center bg-[#397c57] px-6 py-4 font-display text-sm font-bold uppercase tracking-[0.08em] text-[#fdf5e0] shadow-[0_16px_35px_rgba(57,124,87,0.2)] transition hover:-translate-y-0.5 hover:bg-[#2f6848] sm:mt-10 sm:w-auto sm:px-8"
        >
          Подтвердить присутствие
        </a>
      </div>
    </section>
  );
}
