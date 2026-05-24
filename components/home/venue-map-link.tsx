import { WEDDING_ADDRESS_LINE, WEDDING_MAP_URL } from "@/lib/constants/wedding";
import Image from "next/image";

export function VenueMapLink() {
  return (
    <a
      href={WEDDING_MAP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group mt-1 inline-flex flex-col items-center gap-2 rounded-lg transition-opacity hover:opacity-90"
      aria-label={`Открыть ${WEDDING_ADDRESS_LINE} в 2ГИС`}
    >
      <span className="text-center text-neutral-500 group-hover:text-neutral-700">
        {WEDDING_ADDRESS_LINE}
      </span>
      <Image
        src="/2gis-badge.svg"
        alt="Открыть в 2ГИС"
        width={120}
        height={32}
        className="h-8 w-auto"
      />
    </a>
  );
}
