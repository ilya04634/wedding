import { VenueMapLink } from "@/components/home/venue-map-link";
import type { SiteSettings } from "@/types/settings";
import { Calendar, Clock } from "lucide-react";
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
    <section className="wedding-paper relative isolate min-h-[calc(100svh-57px)] overflow-hidden px-3 py-9 text-center sm:min-h-[calc(100svh-65px)] sm:px-8 sm:py-16 lg:py-20">
      <Image
        src="/wedding-design/wildflowers-wide.png"
        alt=""
        width={740}
        height={423}
        className="pointer-events-none absolute right-0 top-0 z-0 w-56 opacity-90 mix-blend-multiply sm:w-80"
      />
      <Image
        src="/wedding-design/wildflowers-stem.png"
        alt=""
        width={600}
        height={900}
        className="pointer-events-none absolute -bottom-12 -left-16 z-0 w-44 rotate-[-14deg] opacity-75 mix-blend-multiply sm:w-64"
      />
      <div className="absolute -left-32 top-8 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(138,154,122,0.18),_rgba(138,154,122,0)_70%)] sm:h-96 sm:w-96" />
      <div className="absolute -right-28 top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(231,151,150,0.13),_rgba(231,151,150,0)_70%)] sm:-right-20 sm:top-16 sm:h-[32rem] sm:w-[32rem]" />

      <div className="garden-fade relative z-10 mx-auto flex max-w-5xl flex-col items-center">
        <p className="max-w-full border-y border-[#3f8059]/40 px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#3f8059] sm:px-4 sm:text-xs sm:tracking-[0.22em]">
          {eyebrow}
        </p>

        <div className="mt-7 max-w-full sm:mt-8">
          <p className="font-display paper-ink text-[2.45rem] font-semibold uppercase tracking-[0.2em] sm:text-6xl sm:tracking-[0.28em]">
            {settings.heroFamilyName}
          </p>
          <h1 className="font-script paper-green mt-1 text-balance text-[4.15rem] leading-[0.86] sm:text-8xl lg:text-9xl">
            {settings.coupleNames}
          </h1>
        </div>

        <p className="font-display paper-ink mx-auto mt-5 max-w-2xl text-balance text-2xl leading-tight sm:text-4xl lg:text-5xl">
          {settings.heroSubtitle}
        </p>
        <p className="mx-auto mt-5 max-w-2xl text-balance text-[0.95rem] leading-7 text-[#3d361f]/75 sm:mt-6 sm:text-lg sm:leading-8">
          {settings.heroText}
        </p>

        <div className="mt-8 grid w-full max-w-4xl gap-5 text-[#24340d] sm:mt-10 sm:gap-6 md:grid-cols-[0.88fr_1.12fr] md:items-center">
          <div className="paper-card relative mx-auto w-[calc(100%-0.5rem)] max-w-sm px-4 py-6 text-center sm:w-full sm:max-w-none sm:rotate-[-3deg] sm:px-8 sm:py-9">
            <p className="font-script text-3xl leading-none text-[#24340d] sm:text-4xl">
              место проведения
            </p>
            <p className="font-display mt-1 text-[1.7rem] font-semibold uppercase leading-none text-[#3f8059] sm:text-5xl">
              {settings.weddingVenue}
            </p>
            <p className="mt-5 font-display text-base leading-6 text-[#24340d] sm:text-lg">
              по адресу
              <span className="block">{settings.weddingAddressLine}</span>
            </p>
            <div className="mt-5">
              <VenueMapLink
                address={settings.weddingAddressLine}
                mapUrl={settings.weddingMapUrl}
              />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[21rem] sm:max-w-sm">
            <Image
              src="/wedding-design/venue.jpg"
              alt=""
              width={1100}
              height={1375}
              priority
              className="aspect-[4/5] w-full object-cover shadow-[0_22px_60px_rgba(52,49,45,0.16)]"
            />
            <Image
              src="/wedding-design/wildflowers-stem.png"
              alt=""
              width={600}
              height={900}
              className="pointer-events-none absolute -bottom-14 -right-10 w-36 rotate-[18deg] opacity-90 mix-blend-multiply"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-display text-lg text-[#24340d] sm:text-2xl">
          <span className="inline-flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#3f8059]" aria-hidden />
            {settings.weddingDate}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#3f8059]" aria-hidden />
            {settings.weddingTime}
          </span>
        </div>

        <a
          href="#rsvp"
          className="mt-9 inline-flex min-h-12 w-full max-w-sm items-center justify-center bg-[#3f8059] px-6 py-4 font-display text-sm font-bold uppercase tracking-[0.08em] text-[#fbf3d9] shadow-[0_16px_35px_rgba(63,128,89,0.2)] transition hover:-translate-y-0.5 hover:bg-[#326a49] sm:mt-10 sm:w-auto sm:px-8"
        >
          Подтвердить присутствие
        </a>
      </div>
    </section>
  );
}
