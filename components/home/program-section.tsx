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
    <section id="program" className="garden-fade-delay scroll-mt-24 px-4 py-20 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a9a7a]">
            Timing
          </p>
          <h2 className="font-display mt-3 text-4xl text-[#34312d] sm:text-5xl">
            {settings.programTitle}
          </h2>
          <p className="mt-4 text-base leading-7 text-[#746f66]">
            {settings.programDescription}
          </p>
        </div>

        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {items.map((item, index) => {
            const Icon = ICONS[index] ?? ChampagneLineArt;
            const color = COLORS[index] ?? "#8a9a7a";

            return (
              <li
                key={`${item.time}-${item.title}`}
                className="relative overflow-hidden rounded-[2rem] border border-[#8a9a7a]/15 bg-white/65 p-7 shadow-[0_24px_80px_rgba(52,49,45,0.08)] backdrop-blur-sm"
              >
                <div
                  className="absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-35"
                  style={{
                    background: `radial-gradient(circle, ${color} 0%, transparent 68%)`,
                  }}
                />
                <Icon className="relative h-20 w-20 text-[#6f7b62]" />
                <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em]" style={{ color }}>
                  {item.time}
                </p>
                <h3 className="font-display mt-2 text-3xl text-[#34312d]">
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
