import { WEDDING_ADDRESS_LINE, WEDDING_MAP_URL } from "@/lib/constants/wedding";
import Image from "next/image";

export function VenueMapLink() {
  return (
    <a
      href={WEDDING_MAP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group mt-1 inline-flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-neutral-100"
      aria-label={`Открыть ${WEDDING_ADDRESS_LINE} в 2ГИС`}
    >
      <Image
        src="/2gis-badge.svg"
        alt="Открыть в 2ГИС"
        width={32}
        height={32}
        className="h-8 w-8"
      />
      <span className="text-left text-neutral-500 group-hover:text-neutral-700">
        {WEDDING_ADDRESS_LINE}
      </span>
    </a>
  );
}
