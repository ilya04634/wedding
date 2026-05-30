import Image from "next/image";

interface VenueMapLinkProps {
  address: string;
  mapUrl: string;
}

export function VenueMapLink({ address, mapUrl }: VenueMapLinkProps) {
  return (
    <a
      href={mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group mt-1 inline-flex items-center justify-center rounded-lg px-2 py-1 transition-colors hover:bg-neutral-100"
      aria-label={`Открыть ${address} в 2ГИС`}
    >
      <Image
        src="/2gis-badge.svg"
        alt="Открыть в 2ГИС"
        width={32}
        height={32}
        className="h-8 w-8"
      />
    </a>
  );
}
