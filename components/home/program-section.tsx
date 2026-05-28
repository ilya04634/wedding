import type { SiteSettings } from "@/types/settings";

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
        stroke="#8a9a7a"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M21 58 C17 52 12 51 8 55 C12 60 16 61 21 58 Z"
        stroke="#8a9a7a"
        strokeWidth="1"
      />
      <path
        d="M28 53 C27 47 23 44 18 45 C19 51 23 54 28 53 Z"
        stroke="#8a9a7a"
        strokeWidth="1"
      />
    </svg>
  );
}

const POSITIONS = [
  "right-5 top-[9%] text-right sm:right-16",
  "left-3 top-[31%] text-left sm:left-8",
  "right-7 top-[56%] text-right sm:right-20",
  "left-3 top-[79%] text-left sm:left-8",
];

const ROSES = [
  "left-[18%] top-[12%]",
  "right-[23%] top-[27%]",
  "left-[30%] top-[51%]",
  "right-[12%] top-[78%]",
];

export function ProgramSection({ settings }: ProgramSectionProps) {
  const items = settings.programItems;

  return (
    <section
      id="program"
      className="garden-fade-delay scroll-mt-24 bg-[#fbf3d9] px-4 py-16 sm:px-8 sm:py-24"
    >
      <div className="mx-auto max-w-md sm:max-w-2xl">
        <div className="text-center">
          <h2 className="text-[#4f5609]">
            <span className="font-script block text-5xl leading-none sm:text-7xl">
              План
            </span>
            <span className="font-display -mt-2 block text-3xl uppercase tracking-[0.18em] sm:text-5xl">
              мероприятия
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-sm text-sm uppercase leading-5 tracking-[0.08em] text-[#4f5609]/70 sm:text-base">
            {settings.programDescription}
          </p>
        </div>

        <ol className="relative mx-auto mt-10 h-[44rem] max-w-sm sm:h-[54rem] sm:max-w-md">
          <svg
            className="pointer-events-none absolute inset-y-0 left-1/2 h-full w-full -translate-x-1/2 text-[#4f5609]"
            viewBox="0 0 360 820"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M135 0 C118 86 205 122 237 176 C288 262 72 300 86 414 C100 528 263 494 235 606 C216 681 116 680 126 820"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.35"
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
              className={`absolute z-10 max-w-[9rem] text-[#4f5609] ${POSITIONS[index] ?? POSITIONS[index % POSITIONS.length]}`}
            >
              <p className="font-script text-2xl leading-none sm:text-3xl">
                {item.title}
              </p>
              <p className="font-display mt-12 text-xl italic leading-none sm:mt-16 sm:text-2xl">
                {item.time}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

