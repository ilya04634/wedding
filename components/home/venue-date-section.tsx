import type { SiteSettings } from "@/types/settings";
import Image from "next/image";

interface VenueDateSectionProps {
  settings: SiteSettings;
}

function getWeddingDay(settings: SiteSettings) {
  const match = settings.weddingDate.match(/\b(\d{1,2})\b/);
  return match ? Number(match[1]) : 21;
}

export function VenueDateSection({ settings }: VenueDateSectionProps) {
  const day = getWeddingDay(settings);
  const days = [day - 2, day - 1, day, day + 1, day + 2];

  return (
    <section className="figma-frame-section figma-frame-section--venue-date scroll-mt-24">
      <div className="figma-phone-frame text-black">
        <div
          className="absolute z-10 h-[362px] w-[266px] overflow-hidden"
          style={{ left: "calc(20% + 9.72px)", top: "calc(10% + 6.13px)" }}
        >
          <Image
            src="/figma-export/images/node-160.png"
            alt=""
            fill
            className="scale-[1.22] object-cover object-[52%_44%]"
            aria-hidden
          />
        </div>

        <div
          className="absolute z-20 flex h-[303.227px] w-[253.765px] items-center justify-center"
          style={{ left: "calc(10% - 11.2px)", top: "calc(10% - 16.1px)" }}
        >
          <div className="h-[282.572px] w-[227.536px] rotate-[-5.54deg] bg-[#fffaed] shadow-[0_18px_38px_rgba(52,49,45,0.08)]" />
        </div>

        <div
          className="absolute z-30 flex h-[24.856px] w-[16.937px] items-center justify-center"
          style={{ left: "calc(40% + 0.2px)", top: "calc(25% + 26.25px)" }}
          aria-hidden
        >
          <div className="relative h-full w-full -scale-y-100 rotate-[174.46deg]">
            <Image src="/figma-wedding/venue-clover.svg" alt="" fill />
          </div>
        </div>

        <p
          className="absolute z-30 whitespace-nowrap font-readable-script text-[24px] leading-[0.89] text-black"
          style={{
            left: "calc(10% + 103.7px)",
            top: "calc(10% + 11.36px)",
            transform: "translateX(-50%) rotate(-5.54deg)",
            width: "218px",
          }}
        >
          место проведения
        </p>
        <p
          className="absolute z-30 w-[240px] text-center font-display text-[25px] uppercase leading-none tracking-[0.52px] text-[#397c57]"
          style={{
            left: "calc(40% - 119px)",
            top: "calc(15% - 2px)",
            transform: "rotate(-5.54deg)",
          }}
        >
          {settings.weddingVenue}
        </p>
        <div
          className="absolute z-30 w-[218px] text-center font-display text-[17px] leading-normal tracking-[0.34px] text-black"
          style={{
            left: "calc(40% - 6.22px)",
            top: "calc(20% + 8.57px)",
            transform: "translateX(-50%) rotate(-5.54deg)",
          }}
        >
          <p>по адресу</p>
          <p>{settings.weddingAddressLine}</p>
        </div>
        <a
          href={settings.weddingMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute z-30 inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-white/70"
          style={{
            left: "calc(40% - 22px)",
            top: "calc(30% + 9.98px)",
            transform: "rotate(-5.54deg)",
          }}
          aria-label={`Открыть ${settings.weddingAddressLine} в 2ГИС`}
        >
          <Image
            src="/2gis-badge.svg"
            alt="Открыть в 2ГИС"
            width={32}
            height={32}
            className="h-8 w-8"
          />
        </a>

        <p
          className="absolute whitespace-nowrap font-readable-script text-[30px] leading-none text-[#397c57]"
          style={{ left: "calc(50% - 49px)", top: "calc(55% + 10.95px)" }}
        >
          {settings.weddingDate}
        </p>
        <p
          className="absolute whitespace-nowrap font-readable-script text-[30px] leading-none text-[#397c57]"
          style={{ left: "calc(50% - 38px)", top: "calc(65% + 34.85px)" }}
        >
          {settings.weddingTime}
        </p>

        <Image
          src="/figma-export/images/node-159.png"
          alt=""
          width={122}
          height={122}
          className="absolute z-10 h-[122px] w-[122px] object-contain"
          style={{ left: "calc(50% - 61px)", top: "calc(60% - 34px)" }}
          aria-hidden
        />

        {days.map((date, index) => {
          const isActive = date === day;
          const positions = [
            { left: "calc(20% - 51.4px)", width: "69px" },
            { left: "calc(40% - 62.8px)", width: "85px" },
            { left: "calc(50% - 17px)", width: "auto" },
            { left: "calc(70% - 30.4px)", width: "78px" },
            { left: "calc(90% - 44px)", width: "73px" },
          ];
          return (
            <p
              key={date}
              className={`absolute z-20 font-display leading-none tracking-[0.72px] text-[#193726] ${
                isActive ? "text-[40px]" : "text-[36px]"
              }`}
              style={{ ...positions[index], top: "calc(60% + 3.4px)" }}
            >
              {date}
            </p>
          );
        })}

        <div
          className="absolute z-10 flex h-[219.057px] w-[239.043px] items-center justify-center"
          style={{ left: "calc(60% - 5.2px)", top: "calc(60% + 3.4px)" }}
        >
          <div className="relative h-[178.54px] w-[204.944px] rotate-[-12.64deg]">
            <Image
              src="/figma-export/images/node-185.png"
              alt=""
              fill
              className="object-bottom"
              aria-hidden
            />
          </div>
        </div>
        <div
          className="absolute z-20 h-[50px] w-[48px] overflow-hidden"
          style={{ left: "calc(10% + 3.8px)", top: "calc(45% + 25.05px)" }}
          aria-hidden
        >
          <Image
            src="/figma-export/images/garden-party-diy-o-1-186.png"
            alt=""
            fill
            className="object-contain"
          />
        </div>
        <div
          className="absolute z-20 flex h-[90.444px] w-[90.283px] items-center justify-center"
          style={{ left: "calc(20% - 28.04px)", top: "calc(45% + 35.33px)" }}
          aria-hidden
        >
          <div className="relative h-[65px] w-[63px] -scale-y-100 rotate-[-138.26deg] overflow-hidden">
            <Image
              src="/figma-export/images/garden-party-diy-o-2-187.png"
              alt=""
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
