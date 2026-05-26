import {
  ArchLineArt,
  CakeLineArt,
  ChampagneLineArt,
} from "@/components/home/line-art";
import type { SiteSettings } from "@/types/settings";

interface ProgramSectionProps {
  settings: SiteSettings;
}

const ICONS = [ChampagneLineArt, ArchLineArt, CakeLineArt];
const COLORS = ["#8a9a7a", "#e79796", "#f4d03f"];

export function ProgramSection({ settings }: ProgramSectionProps) {
  const items = settings.programItems.slice(0, 3);

  return (
    <section id="program" className="garden-fade-delay scroll-mt-24 px-4 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
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

        <ol className="mt-9 grid gap-4 sm:mt-12 md:grid-cols-3 md:gap-5">
          {items.map((item, index) => {
            const Icon = ICONS[index] ?? ChampagneLineArt;
            const color = COLORS[index] ?? "#8a9a7a";

            return (
              <li
                key={`${item.time}-${item.title}`}
                className="relative overflow-hidden rounded-3xl border border-[#8a9a7a]/15 bg-white/65 p-5 shadow-[0_18px_55px_rgba(52,49,45,0.07)] backdrop-blur-sm sm:p-7 sm:shadow-[0_24px_80px_rgba(52,49,45,0.08)]"
              >
                <div
                  className="absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-35"
                  style={{
                    background: `radial-gradient(circle, ${color} 0%, transparent 68%)`,
                  }}
                />
                <Icon className="relative h-16 w-16 text-[#6f7b62] sm:h-20 sm:w-20" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] sm:mt-6 sm:text-sm sm:tracking-[0.2em]" style={{ color }}>
                  {item.time}
                </p>
                <h3 className="font-display mt-2 text-2xl leading-tight text-[#34312d] sm:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#746f66]">
                  {item.description}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
