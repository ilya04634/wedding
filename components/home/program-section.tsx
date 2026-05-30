import type { SiteSettings } from "@/types/settings";
import Image from "next/image";

interface ProgramSectionProps {
  settings: SiteSettings;
}

const ITEM_POSITIONS = [
  "left-[50%] top-[18%] max-w-[11.5rem]",
  "left-[7%] top-[39%] max-w-[11.5rem]",
  "left-[50%] top-[60%] max-w-[12rem]",
  "left-[7%] top-[82%] max-w-[11.5rem]",
];

const DECORATIONS = [
  {
    src: "/wedding-design/figma-program-rings.png",
    className: "left-[9%] top-[30%] w-20 sm:left-[18%]",
  },
  {
    src: "/wedding-design/figma-program-hourglass.png",
    className: "right-[9%] top-[43%] w-16 opacity-80 sm:right-[22%]",
  },
  {
    src: "/wedding-design/figma-program-cocktail.png",
    className: "left-[6%] top-[63%] w-20 sm:left-[19%]",
  },
];

export function ProgramSection({ settings }: ProgramSectionProps) {
  const items = settings.programItems;

  return (
    <section
      id="program"
      className="wedding-paper relative isolate scroll-mt-24 overflow-hidden px-5 pb-10 pt-16 text-[#050500] sm:px-8 sm:py-24"
    >
      <Image
        src="/wedding-design/figma-program-bouquet.png"
        alt=""
        width={740}
        height={423}
        className="pointer-events-none absolute -right-10 -top-6 z-0 w-52 rotate-[-2deg] mix-blend-multiply sm:right-[8%] sm:top-0 sm:w-72 lg:right-[18%]"
      />

      <div className="relative z-10 mx-auto max-w-md sm:max-w-2xl">
        <header className="relative pr-20 text-left sm:text-center">
          <h2 className="text-[#050500]">
            <span className="font-script block text-[4.2rem] leading-none sm:text-8xl">
              План
            </span>
            <span className="font-display -mt-4 block text-[2.05rem] uppercase leading-none tracking-[0.12em] sm:text-5xl">
              мероприятия
            </span>
          </h2>
        </header>

        <ol className="relative mx-auto mt-8 h-[52rem] max-w-[24rem] sm:mt-12 sm:h-[64rem] sm:max-w-lg">
          <Image
            src="/wedding-design/figma-program-line.svg"
            alt=""
            width={270}
            height={686}
            className="pointer-events-none absolute left-[16%] top-0 h-full w-[74%] object-fill sm:left-[23%] sm:w-[58%]"
          />

          {DECORATIONS.map((item) => (
            <Image
              key={item.src}
              src={item.src}
              alt=""
              width={736}
              height={736}
              className={`pointer-events-none absolute z-0 mix-blend-multiply ${item.className}`}
            />
          ))}

          {items.map((item, index) => (
            <li
              key={`${item.time}-${item.title}`}
              className={`absolute z-10 ${ITEM_POSITIONS[index] ?? ITEM_POSITIONS[index % ITEM_POSITIONS.length]}`}
            >
              <p className="font-script text-[2rem] leading-none sm:text-[2.75rem]">
                {item.title}
              </p>
              <p className="font-display mt-1 text-[1rem] uppercase leading-[0.95] tracking-[0.08em] sm:text-xl">
                {item.description}
              </p>
              <p className="font-script mt-4 text-[1.8rem] leading-none sm:text-[2.35rem]">
                {item.time}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
