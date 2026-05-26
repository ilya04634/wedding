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
    <section className="py-14 text-center sm:py-20">
      <p className="mb-3 text-sm uppercase text-neutral-500">{eyebrow}</p>
      <h1 className="text-balance font-[family-name:var(--font-geist-sans)] text-4xl font-light tracking-tight text-neutral-900 sm:text-5xl">
        {settings.coupleNames}
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-balance text-base leading-7 text-neutral-600">
        {settings.heroText}
      </p>
      <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 text-sm text-neutral-700">
        <p className="flex items-center justify-center gap-2">
          <Calendar className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
          <span>
            {settings.weddingDate}, {settings.weddingTime}
          </span>
        </p>
        <div className="flex flex-col items-center gap-1">
          <p className="flex items-center justify-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
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
        className="mt-10 inline-block rounded-lg border border-neutral-900 px-6 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
      >
        Перейти к анкете
      </a>
    </section>
  );
}
