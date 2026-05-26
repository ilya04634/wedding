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

        <ol className="relative mx-auto mt-10 max-w-xl overflow-visible px-1 py-8 sm:mt-14 sm:max-w-3xl sm:py-12">
          <svg
            className="pointer-events-none absolute -bottom-16 -top-16 left-0 z-0 h-[calc(100%+8rem)] w-full text-[#8a9a7a]/34 sm:hidden"
            viewBox="0 0 320 980"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M-8 -20 C52 52 86 92 82 148 C76 226 236 228 254 326 C272 428 56 430 54 548 C52 670 264 662 260 780 C256 866 86 884 8 1000"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
          <svg
            className="pointer-events-none absolute -bottom-20 -top-20 left-1/2 z-0 hidden h-[calc(100%+10rem)] w-[min(58rem,118vw)] -translate-x-1/2 text-[#8a9a7a]/34 sm:block"
            viewBox="0 0 860 1040"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M-70 -24 C116 58 206 102 198 176 C188 278 656 274 700 396 C746 524 116 526 114 668 C112 806 700 782 690 914 C684 1002 144 1016 -82 1070"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {items.map((item, index) => {
            const Icon = ICONS[index] ?? ChampagneLineArt;
            const color = COLORS[index] ?? "#8a9a7a";
            const isRight = index % 2 === 0;

            return (
              <li
                key={`${item.time}-${item.title}`}
                className="relative z-10 min-h-48 py-5 sm:min-h-56 sm:py-7"
              >
                <div
                  className={[
                    "absolute top-1/2 -z-10 h-36 w-52 -translate-y-1/2 rounded-full opacity-35 blur-2xl",
                    isRight ? "right-4" : "left-4",
                  ].join(" ")}
                  style={{
                    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                  }}
                />
                <div
                  className={[
                    "absolute top-1/2 z-10 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full bg-[#fdfbf7]/90 text-[#6f7b62] shadow-[0_12px_35px_rgba(52,49,45,0.06)] sm:h-24 sm:w-24",
                    isRight ? "left-2 sm:left-10" : "right-2 sm:right-10",
                  ].join(" ")}
                >
                  <Icon className="h-14 w-14 sm:h-16 sm:w-16" />
                </div>
                <div
                  className={[
                    "relative z-20 w-[64%] rounded-[1.5rem] bg-[#fdfbf7]/92 px-4 py-3 shadow-[0_14px_45px_rgba(52,49,45,0.06)] backdrop-blur-[2px] sm:w-[48%] sm:px-5 sm:py-4",
                    isRight ? "ml-auto text-left" : "mr-auto text-right",
                  ].join(" ")}
                >
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
