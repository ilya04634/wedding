import {
  ArchLineArt,
  CakeLineArt,
  ChampagneLineArt,
} from "@/components/home/line-art";
import type { SiteSettings } from "@/types/settings";
import { Clock3 } from "lucide-react";

interface ProgramSectionProps {
  settings: SiteSettings;
}

const ICONS = [ChampagneLineArt, ArchLineArt, CakeLineArt, Clock3];
const COLORS = ["#8a9a7a", "#e79796", "#f4d03f", "#8a9a7a"];

export function ProgramSection({ settings }: ProgramSectionProps) {
  const items = settings.programItems;

  return (
    <section id="program" className="garden-fade-delay scroll-mt-24 px-4 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#8a9a7a] sm:text-xs sm:tracking-[0.24em]">
            Timing
          </p>
          <h2 className="font-display mt-3 text-3xl leading-tight text-[#34312d] sm:text-5xl">
            {settings.programTitle}
          </h2>
          <p className="mt-4 text-base leading-7 text-[#746f66]">
            {settings.programDescription}
          </p>
        </div>

        <ol className="relative mx-auto mt-10 min-h-[34rem] max-w-xl overflow-hidden px-1 py-4 sm:mt-14 sm:min-h-[42rem] sm:max-w-2xl">
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full text-[#8a9a7a]/45"
            viewBox="0 0 320 760"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M6 18 C268 74 272 160 116 230 C-24 293 24 380 242 446 C365 483 330 610 70 720"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
          {items.map((item, index) => {
            const Icon = ICONS[index] ?? ChampagneLineArt;
            const color = COLORS[index] ?? "#8a9a7a";
            const isRight = index % 2 === 1;

            return (
              <li
                key={`${item.time}-${item.title}`}
                className={[
                  "relative flex min-h-32 w-[78%] items-center gap-4 py-3 sm:min-h-40 sm:w-[68%]",
                  isRight ? "ml-auto flex-row-reverse text-right" : "mr-auto text-left",
                ].join(" ")}
              >
                <div
                  className="absolute inset-0 -z-10 rounded-full opacity-40 blur-2xl"
                  style={{
                    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                  }}
                />
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#fdfbf7]/70 text-[#6f7b62] sm:h-24 sm:w-24">
                  <Icon className="h-14 w-14 sm:h-16 sm:w-16" />
                </div>
                <div className="min-w-0">
                  <p className="font-script text-3xl leading-none sm:text-4xl" style={{ color }}>
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-[#c7b96f] sm:text-base">
                    {item.time}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#746f66] sm:text-sm sm:leading-6">
                    {item.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
