import { FlowerLineArt } from "@/components/home/line-art";
import { VenueMapLink } from "@/components/home/venue-map-link";
import type { SiteSettings } from "@/types/settings";
import { Calendar, MapPin } from "lucide-react";

interface HeroSectionProps {
  guestName?: string;
  settings: SiteSettings;
}

export function HeroSection({ guestName, settings }: HeroSectionProps) {
  const eyebrow = guestName
    ? settings.heroPersonalEyebrowTemplate.replaceAll("{{guestName}}", guestName)
    : settings.heroDefaultEyebrow;

  return (
    <section className="relative isolate min-h-[calc(100svh-57px)] overflow-hidden px-4 py-10 text-center sm:min-h-[calc(100svh-65px)] sm:px-8 sm:py-20 lg:py-24">
      <div className="absolute -left-32 top-8 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(138,154,122,0.3),_rgba(138,154,122,0)_70%)] sm:h-96 sm:w-96" />
      <div className="absolute -right-28 top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(231,151,150,0.3),_rgba(231,151,150,0)_70%)] sm:-right-20 sm:top-16 sm:h-[32rem] sm:w-[32rem]" />
      <div className="absolute bottom-6 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(244,208,63,0.24),_rgba(244,208,63,0)_70%)] sm:h-80 sm:w-80" />

      <FlowerLineArt className="absolute right-4 top-28 hidden h-64 w-64 text-[#8a9a7a]/70 sm:block" />

      <div className="garden-fade relative z-10 mx-auto flex max-w-4xl flex-col items-center">
        <p className="max-w-full rounded-full border border-[#8a9a7a]/25 bg-white/55 px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#8a9a7a] sm:px-4 sm:text-xs sm:tracking-[0.22em]">
          {eyebrow}
        </p>
        <div className="mt-7 max-w-full sm:mt-8">
          <p className="font-display text-4xl font-semibold uppercase tracking-[0.22em] text-[#34312d] sm:text-6xl sm:tracking-[0.28em]">
            {settings.heroFamilyName}
          </p>
          <h1 className="font-script mt-1 text-balance text-[4.4rem] leading-[0.86] text-[#e79796] sm:text-8xl lg:text-9xl">
            {settings.coupleNames}
          </h1>
        </div>
        <p className="font-display mx-auto mt-5 max-w-2xl text-balance text-2xl leading-tight text-[#34312d] sm:text-4xl lg:text-5xl">
          {settings.heroSubtitle}
        </p>
        <p className="mx-auto mt-5 max-w-2xl text-balance text-[0.95rem] leading-7 text-[#746f66] sm:mt-6 sm:text-lg sm:leading-8">
          {settings.heroText}
        </p>

        <div className="mt-8 grid w-full max-w-2xl gap-3 text-sm text-[#34312d] sm:mt-9 sm:grid-cols-2">
          <div className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-[#8a9a7a]/20 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-sm sm:py-4">
            <Calendar className="h-4 w-4 shrink-0 text-[#e79796]" aria-hidden />
            <span>
              {settings.weddingDate}, {settings.weddingTime}
            </span>
          </div>
          <div className="flex min-h-14 flex-col items-center gap-1 rounded-2xl border border-[#8a9a7a]/20 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-sm sm:py-4">
            <p className="flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-[#e79796]" aria-hidden />
              <span>{settings.weddingVenue}</span>
            </p>
            <VenueMapLink
              address={settings.weddingAddressLine}
              mapUrl={settings.weddingMapUrl}
            />
          </div>
        </div>

        <a
          href="#rsvp"
          className="mt-9 inline-flex min-h-12 w-full max-w-sm items-center justify-center rounded-full bg-[#e79796] px-6 py-4 text-sm font-bold text-white shadow-[0_16px_35px_rgba(231,151,150,0.35)] transition hover:-translate-y-0.5 hover:bg-[#d98584] sm:mt-10 sm:w-auto sm:px-8"
        >
          Подтвердить присутствие
        </a>
      </div>
    </section>
  );
}
