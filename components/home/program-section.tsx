import type { SiteSettings } from "@/types/settings";
import Image from "next/image";

interface ProgramSectionProps {
  settings: SiteSettings;
}

function RoseAccent({
  className,
  rotate = 0,
}: {
  className?: string;
  rotate?: number;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 72 72"
      fill="none"
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden
    >
      <path
        d="M36 49 C31 43 25 42 23 36 C21 29 28 22 36 22 C45 22 52 30 49 39 C47 45 42 47 36 49 Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M35 47 C33 39 36 34 42 31 C38 30 33 31 30 36 C30 31 34 27 39 25"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M34 49 C29 56 24 59 17 61"
        stroke="#3f8059"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M21 58 C17 52 12 51 8 55 C12 60 16 61 21 58 Z"
        stroke="#3f8059"
        strokeWidth="1"
      />
      <path
        d="M28 53 C27 47 23 44 18 45 C19 51 23 54 28 53 Z"
        stroke="#3f8059"
        strokeWidth="1"
      />
    </svg>
  );
}

const POSITIONS = [
  "right-1 top-[13%] text-left sm:right-12",
  "left-1 top-[34%] text-left sm:left-8",
  "right-1 top-[58%] text-left sm:right-12",
  "left-1 top-[82%] text-left sm:left-8",
];

const ROSES = [
  "left-[20%] top-[16%]",
  "right-[27%] top-[34%]",
  "left-[31%] top-[55%]",
  "right-[18%] top-[78%]",
];

const ILLUSTRATIONS = [
  "/wedding-design/rings.png",
  "/wedding-design/wildflowers-stem.png",
  "/wedding-design/cocktail.png",
  "/wedding-design/wildflowers-stem.png",
];

const ILLUSTRATION_POSITIONS = [
  "left-2 top-[21%] w-16 opacity-80 sm:left-6 sm:w-24",
  "right-4 top-[40%] w-16 rotate-[18deg] opacity-55 sm:right-12 sm:w-24",
  "left-0 top-[63%] w-16 opacity-80 sm:left-8 sm:w-24",
  "right-8 top-[84%] w-14 rotate-[-20deg] opacity-55 sm:w-20",
];

export function ProgramSection({ settings }: ProgramSectionProps) {
  const items = settings.programItems;

  return (
    <section
      id="program"
      className="wedding-paper relative isolate scroll-mt-24 overflow-hidden px-4 py-16 sm:px-8 sm:py-24"
    >
      <Image
        src="/wedding-design/wildflowers-wide.png"
        alt=""
        width={740}
        height={423}
        className="pointer-events-none absolute right-0 top-0 w-52 opacity-85 mix-blend-multiply sm:w-80"
      />
      <div className="mx-auto max-w-md sm:max-w-2xl">
        <div className="text-left sm:text-center">
          <h2 className="paper-ink">
            <span className="font-script block text-5xl leading-none sm:text-7xl">
              План
            </span>
            <span className="font-display -mt-2 block text-3xl uppercase tracking-[0.18em] sm:text-5xl">
              мероприятия
            </span>
          </h2>
          <p className="mt-5 max-w-sm font-display text-sm uppercase leading-5 tracking-[0.08em] text-[#24340d]/70 sm:mx-auto sm:text-base">
            {settings.programDescription}
          </p>
        </div>

        <ol className="relative mx-auto mt-10 h-[62rem] max-w-sm sm:h-[62rem] sm:max-w-md">
          <svg
            className="pointer-events-none absolute inset-y-0 left-1/2 h-full w-full -translate-x-1/2 text-[#3f8059]"
            viewBox="0 0 360 920"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M176 0 C150 96 218 148 222 232 C228 346 132 366 128 482 C124 596 220 626 218 724 C216 822 166 842 176 920"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.15"
              strokeLinecap="round"
            />
          </svg>

          {ROSES.map((position, index) => (
            <RoseAccent
              key={position}
              className={`absolute h-14 w-14 text-[#bd7e8b] sm:h-16 sm:w-16 ${position}`}
              rotate={index % 2 === 0 ? -18 : 22}
            />
          ))}

          {items.map((item, index) => (
            <li
              key={`${item.time}-${item.title}`}
              className={`absolute z-10 max-w-[8rem] rounded-sm bg-[#fbf3d9]/70 px-1.5 py-1 text-[#24340d] backdrop-blur-[1px] sm:max-w-[11rem] sm:bg-transparent sm:p-0 sm:backdrop-blur-0 ${POSITIONS[index] ?? POSITIONS[index % POSITIONS.length]}`}
            >
              <p className="font-script text-3xl leading-none sm:text-4xl">
                {item.title}
              </p>
              <p className="mt-2 font-display text-[0.98rem] uppercase leading-[1.16] tracking-[0.07em] sm:text-lg sm:leading-5 sm:tracking-[0.08em]">
                {item.description}
              </p>
              <p className="font-display mt-4 text-2xl italic leading-none sm:mt-5 sm:text-3xl">
                {item.time}
              </p>
            </li>
          ))}

          {items.map((item, index) => (
            <Image
              key={`${item.time}-illustration`}
              src={ILLUSTRATIONS[index] ?? ILLUSTRATIONS[index % ILLUSTRATIONS.length]}
              alt=""
              width={736}
              height={736}
              className={`pointer-events-none absolute z-0 mix-blend-multiply ${ILLUSTRATION_POSITIONS[index] ?? ILLUSTRATION_POSITIONS[index % ILLUSTRATION_POSITIONS.length]}`}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}
