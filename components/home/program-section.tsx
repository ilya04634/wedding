import type { SiteSettings } from "@/types/settings";
import Image from "next/image";
import type { CSSProperties } from "react";

interface ProgramSectionProps {
  settings: SiteSettings;
}

const itemLayout = [
  {
    title: { left: "calc(50% - 2px)", top: "calc(25% + 25.25px)" },
    description: { left: "calc(50% - 2px)", top: "calc(30% + 2.7px)" },
    time: { left: "calc(50% - 2px)", top: "calc(35% + 11.15px)" },
  },
  {
    title: { left: "calc(10% + 4.8px)", top: "calc(45% + 31.05px)" },
    description: { left: "calc(10% + 4.8px)", top: "calc(50% + 15.5px)" },
    time: { left: "calc(10% + 4.8px)", top: "calc(55% + 16.95px)" },
  },
  {
    title: { left: "calc(50% - 4px)", top: "calc(65% + 18.85px)" },
    description: { left: "calc(50% - 4px)", top: "calc(70% - 3.7px)" },
    time: { left: "calc(50% - 4px)", top: "calc(75% + 4.75px)" },
  },
  {
    title: { left: "calc(10% + 4.8px)", top: "calc(85% + 21.65px)" },
    description: { left: "calc(10% + 4.8px)", top: "calc(90% - 0.9px)" },
    time: { left: "calc(10% + 4.8px)", top: "calc(95% + 7.55px)" },
  },
] as const;

const roseDecor = [
  {
    src: "/figma-wedding/program-rose-1.svg",
    wrapper: {
      left: "calc(20% + 4.6px)",
      top: "calc(30% + 27.71px)",
      width: "45.202px",
      height: "46.221px",
    },
    inner: "rotate-[52.44deg]",
  },
  {
    src: "/figma-wedding/program-rose-2.svg",
    wrapper: {
      left: "calc(60% - 9.2px)",
      top: "calc(45% - 5.95px)",
      width: "45.202px",
      height: "46.221px",
    },
    inner: "rotate-[52.44deg]",
  },
  {
    src: "/figma-wedding/program-rose-3.svg",
    wrapper: {
      left: "calc(40% + 18.2px)",
      top: "calc(60% - 4.6px)",
      width: "45.202px",
      height: "46.221px",
    },
    inner: "-scale-y-100 rotate-[127.56deg]",
  },
  {
    src: "/figma-wedding/program-rose-4.svg",
    wrapper: {
      left: "calc(30% - 10px)",
      top: "calc(70% + 25.78px)",
      width: "39.753px",
      height: "43.19px",
    },
    inner: "-scale-y-100 rotate-[-109.1deg]",
  },
  {
    src: "/figma-wedding/program-rose-5.svg",
    wrapper: {
      left: "calc(70% + 22.61px)",
      top: "calc(85% + 30.65px)",
      width: "46.112px",
      height: "44.802px",
    },
    inner: "-scale-y-100 rotate-[-144.58deg]",
  },
] as const;

const leafDecor = [
  {
    src: "/figma-wedding/program-leaf-1.svg",
    wrapper: {
      left: "calc(40% - 10.8px)",
      top: "calc(35% + 26.15px)",
      width: "24.492px",
      height: "32.483px",
    },
    inner: "rotate-[-23.7deg]",
  },
  {
    src: "/figma-wedding/program-leaf-2.svg",
    wrapper: {
      left: "calc(10% + 4.8px)",
      top: "calc(30% - 6.3px)",
      width: "31.566px",
      height: "19.416px",
    },
    inner: "rotate-[-78.52deg]",
  },
  {
    src: "/figma-wedding/program-leaf-3.svg",
    wrapper: {
      left: "calc(60% + 25.8px)",
      top: "calc(55% - 7.05px)",
      width: "31.566px",
      height: "19.416px",
    },
    inner: "-scale-y-100 rotate-[-101.48deg]",
  },
  {
    src: "/figma-wedding/program-leaf-4.svg",
    wrapper: {
      left: "calc(50% + 19.79px)",
      top: "calc(80% + 22.17px)",
      width: "13.981px",
      height: "29.465px",
    },
    inner: "-scale-y-100 rotate-[-179.73deg]",
  },
  {
    src: "/figma-wedding/program-leaf-5.svg",
    wrapper: {
      left: "calc(40% - 19.8px)",
      top: "calc(80% + 13.2px)",
      width: "31.306px",
      height: "18.582px",
    },
    inner: "-scale-y-100 rotate-[99.67deg]",
  },
  {
    src: "/figma-wedding/program-leaf-6.svg",
    wrapper: {
      left: "calc(80% - 1.6px)",
      top: "calc(95% + 6.55px)",
      width: "31.177px",
      height: "29.864px",
    },
    inner: "rotate-[48.42deg]",
  },
  {
    src: "/figma-wedding/program-leaf-7.svg",
    wrapper: {
      left: "calc(30% - 2.6px)",
      top: "calc(65% + 7.85px)",
      width: "26.625px",
      height: "32.389px",
    },
    inner: "-scale-y-100 rotate-[150.19deg]",
  },
  {
    src: "/figma-wedding/program-leaf-8.svg",
    wrapper: {
      left: "calc(40% + 17.2px)",
      top: "calc(40% + 20.6px)",
      width: "24.492px",
      height: "32.483px",
    },
    inner: "rotate-[156.3deg]",
  },
] as const;

function DecorImage({
  src,
  wrapper,
  inner,
}: {
  src: string;
  wrapper: CSSProperties;
  inner: string;
}) {
  return (
    <div
      className="absolute z-20 flex items-center justify-center"
      style={wrapper}
      aria-hidden
    >
      <div className={`relative h-full w-full flex-none ${inner}`}>
        <Image src={src} alt="" fill className="object-contain" />
      </div>
    </div>
  );
}

export function ProgramSection({ settings }: ProgramSectionProps) {
  const items = settings.programItems.slice(0, 4);

  return (
    <section id="program" className="figma-frame-section scroll-mt-24">
      <div className="figma-phone-frame text-black">
        <p
          className="absolute z-30 whitespace-nowrap font-readable-script text-[48px] leading-none text-black"
          style={{ left: "calc(20% - 24.4px)", top: "calc(10% + 22.9px)" }}
        >
          План
        </p>
        <p
          className="absolute z-30 whitespace-nowrap font-display text-[32px] uppercase leading-none tracking-[2.88px] text-black"
          style={{ left: "calc(30% - 25.6px)", top: "calc(15% + 13.35px)" }}
        >
          мероприятия
        </p>
        <p
          className="absolute z-30 w-[356px] font-display text-[16px] uppercase leading-[1.22] tracking-[1.44px] text-black/70"
          style={{ left: "16px", top: "calc(20% + 36px)" }}
        >
          {settings.programDescription}
        </p>

        <Image
          src="/figma-export/images/vector-1-57.svg"
          alt=""
          width={269}
          height={686}
          className="absolute z-10 max-w-none"
          style={{
            left: "calc(20% - 12.9px)",
            top: "calc(25% + 16.25px)",
            width: "269.357px",
            height: "686px",
          }}
          aria-hidden
        />

        {roseDecor.map((item) => (
          <DecorImage key={item.src} {...item} />
        ))}
        {leafDecor.map((item) => (
          <DecorImage key={item.src} {...item} />
        ))}

        {items.map((item, index) => {
          const layout = itemLayout[index] ?? itemLayout[index % itemLayout.length];
          return (
            <div key={`${item.time}-${item.title}`}>
              <p
                className="absolute z-30 whitespace-nowrap font-readable-script text-[24px] leading-none text-black"
                style={layout.title}
              >
                {item.title}
              </p>
              <p
                className="absolute z-30 w-[193px] whitespace-pre-wrap font-display text-[16px] leading-[0.9] tracking-[1.44px] text-black"
                style={layout.description}
              >
                {item.description}
              </p>
              <p
                className="absolute z-30 whitespace-nowrap font-readable-script text-[24px] leading-none text-black"
                style={layout.time}
              >
                {item.time}
              </p>
            </div>
          );
        })}

        <div
          className="absolute z-20 flex h-[168px] w-[168px] items-center justify-center"
          style={{ left: "222px", top: "78px" }}
        >
          <div className="relative h-full w-full">
            <Image
              src="/figma-export/images/node-154.png"
              alt=""
              fill
              className="object-contain object-right-top"
              aria-hidden
            />
          </div>
        </div>
        <div
          className="absolute z-20 flex h-[93.877px] w-[72.979px] items-center justify-center"
          style={{ left: "calc(80% - 5.6px)", top: "calc(45% + 24.05px)" }}
        >
          <div className="relative h-[84.509px] w-[58.269px] rotate-[-10.73deg] overflow-hidden">
            <Image
              src="/figma-export/images/node-155.png"
              alt=""
              fill
              className="object-contain"
              aria-hidden
            />
          </div>
        </div>
        <div
          className="absolute z-20 flex h-[75.153px] w-[63.786px] items-center justify-center"
          style={{ left: "calc(10% - 4.2px)", top: "calc(70% - 2.7px)" }}
        >
          <div className="relative h-[69px] w-[56px] rotate-[6.81deg]">
            <Image
              src="/figma-export/images/image-13-156.png"
              alt=""
              fill
              className="object-contain"
              aria-hidden
            />
          </div>
        </div>
        <Image
          src="/figma-export/images/node-157.png"
          alt=""
          width={80}
          height={81}
          className="absolute z-20 h-[81px] w-[80px] object-cover"
          style={{ left: "calc(10% + 1.8px)", top: "calc(35% + 31.15px)" }}
          aria-hidden
        />
      </div>
    </section>
  );
}
