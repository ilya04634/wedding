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
    <section className="relative isolate min-h-[calc(100svh-64px)] overflow-hidden px-4 py-16 text-center sm:px-8 sm:py-24">
      <div className="absolute -left-28 top-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(138,154,122,0.34),_rgba(138,154,122,0)_70%)] sm:h-96 sm:w-96" />
      <div className="absolute -right-20 top-16 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(231,151,150,0.34),_rgba(231,151,150,0)_70%)] sm:h-[32rem] sm:w-[32rem]" />
      <div className="absolute bottom-10 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(244,208,63,0.28),_rgba(244,208,63,0)_70%)] sm:h-80 sm:w-80" />

      <FlowerLineArt className="absolute right-4 top-28 hidden h-64 w-64 text-[#8a9a7a]/70 sm:block" />

      <div className="garden-fade relative z-10 mx-auto flex max-w-4xl flex-col items-center">
        <p className="rounded-full border border-[#8a9a7a]/25 bg-white/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#8a9a7a]">
          {eyebrow}
        </p>
        <h1 className="font-script mt-8 text-balance text-7xl leading-none text-[#34312d] sm:text-9xl">
          {settings.coupleNames}
        </h1>
        <p className="font-display mx-auto mt-5 max-w-2xl text-balance text-3xl leading-tight text-[#34312d] sm:text-5xl">
          Летняя свадьба в садовом настроении
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-8 text-[#746f66] sm:text-lg">
          {settings.heroText}
        </p>

        <div className="mt-9 grid w-full max-w-2xl gap-3 text-sm text-[#34312d] sm:grid-cols-2">
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#8a9a7a]/20 bg-white/55 px-4 py-4 shadow-sm backdrop-blur-sm">
            <Calendar className="h-4 w-4 shrink-0 text-[#e79796]" aria-hidden />
            <span>
              {settings.weddingDate}, {settings.weddingTime}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-2xl border border-[#8a9a7a]/20 bg-white/55 px-4 py-4 shadow-sm backdrop-blur-sm">
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
          className="mt-10 inline-flex items-center justify-center rounded-full bg-[#e79796] px-8 py-4 text-sm font-bold text-white shadow-[0_16px_35px_rgba(231,151,150,0.35)] transition hover:-translate-y-0.5 hover:bg-[#d98584]"
        >
          Подтвердить присутствие
        </a>
      </div>
    </section>
  );
}
