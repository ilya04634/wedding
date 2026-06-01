import type { SiteSettings } from "@/types/settings";
import Image from "next/image";

interface VenueDateSectionProps {
  settings: SiteSettings;
}

function getWeddingDay(settings: SiteSettings) {
  const match = settings.weddingDate.match(/\b(\d{1,2})\b/);
  return match ? Number(match[1]) : 21;
}

function formatVenueName(venue: string) {
  return venue.trim().toLowerCase() === "jannat regency"
    ? "Jannat Regency"
    : venue.trim();
}

function formatVenueAddress(address: string) {
  return address
    .replace(/улица/gi, "")
    .replace(/,\s*Бишкек/gi, "")
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getWeddingMonthYear(settings: SiteSettings) {
  const match = settings.weddingDate.match(
    /\b\d{1,2}\s+([А-Яа-яЁё]+)\s+(\d{4})\b/,
  );
  if (!match) return settings.weddingDate;

  const months: Record<string, string> = {
    января: "январь",
    февраля: "февраль",
    марта: "март",
    апреля: "апрель",
    мая: "май",
    июня: "июнь",
    июля: "июль",
    августа: "август",
    сентября: "сентябрь",
    октября: "октябрь",
    ноября: "ноябрь",
    декабря: "декабрь",
  };

  const month = months[match[1].toLowerCase()] ?? match[1].toLowerCase();
  return `${month} ${match[2]}`;
}

export function VenueDateSection({ settings }: VenueDateSectionProps) {
  const day = getWeddingDay(settings);
  const days = [day - 2, day - 1, day, day + 1, day + 2];
  const venueName = formatVenueName(settings.weddingVenue);
  const venueAddress = formatVenueAddress(settings.weddingAddressLine);
  const weddingMonthYear = getWeddingMonthYear(settings);

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
          className="absolute z-30 flex h-[22px] w-[18px] items-center justify-center"
          style={{
            left: "calc(40% - 8px)",
            top: "calc(25% + 22px)",
            transform: "rotate(-5.54deg)",
          }}
          aria-hidden
        >
          <div className="relative h-full w-full -scale-y-100 rotate-[174.46deg]">
            <Image src="/figma-wedding/venue-clover.svg" alt="" fill />
          </div>
        </div>

        <p
          className="absolute z-30 w-[218px] text-center font-figma-script text-[24px] leading-[0.89] text-black"
          style={{
            left: "calc(40% - 7px)",
            top: "calc(10% + 3px)",
            transform: "translateX(-50%) rotate(-5.54deg)",
          }}
        >
          место проведения
        </p>
        <p
          className="absolute z-30 w-[218px] text-center font-display text-[28px] uppercase leading-none tracking-[0.04em] text-[#397c57]"
          style={{
            left: "calc(40% - 7px)",
            top: "calc(15% - 12px)",
            transform: "translateX(-50%) rotate(-5.54deg)",
          }}
        >
          Ресторан
        </p>
        <p
          className="absolute z-30 w-[218px] text-center font-display text-[29px] leading-none tracking-[0.02em] text-[#397c57]"
          style={{
            left: "calc(40% - 7px)",
            top: "calc(15% + 20px)",
            transform: "translateX(-50%) rotate(-5.54deg)",
          }}
        >
          {venueName}
        </p>
        <div
          className="absolute z-30 w-[210px] text-center font-display text-[17px] leading-[1.45] tracking-[0.02em] text-black"
          style={{
            left: "calc(40% - 7px)",
            top: "calc(20% + 17px)",
            transform: "translateX(-50%) rotate(-5.54deg)",
          }}
        >
          <p>по адресу</p>
          <p>{venueAddress}</p>
        </div>
        <a
          href={settings.weddingMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute z-30 inline-flex h-[34px] w-[214px] items-center justify-center bg-[#397c57] px-5 font-display text-[16px] leading-none tracking-[0.02em] text-[#fffaf0] shadow-[0_8px_16px_rgba(57,124,87,0.18)] transition-colors hover:bg-[#2f6848]"
          style={{
            left: "calc(40% - 7px)",
            top: "calc(30% + 6px)",
            transform: "translateX(-50%) rotate(-5.54deg)",
          }}
          aria-label={`Открыть маршрут: ${settings.weddingAddressLine}`}
        >
          посмотреть маршрут
        </a>

        <p
          className="absolute whitespace-nowrap font-figma-script text-[30px] leading-none text-[#397c57]"
          style={{
            left: "50%",
            top: "calc(55% + 10.95px)",
            transform: "translateX(-50%)",
          }}
        >
          {weddingMonthYear}
        </p>
        <p
          className="absolute whitespace-nowrap font-figma-script text-[30px] leading-none text-[#397c57]"
          style={{
            left: "50%",
            top: "calc(65% + 34.85px)",
            transform: "translateX(-50%)",
          }}
        >
          вторник
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
          className="absolute z-20 h-[60px] w-[58px] overflow-hidden"
          style={{ left: "calc(10% + 3.8px)", top: "calc(45% + 11px)" }}
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
          className="absolute z-20 flex h-[112px] w-[112px] items-center justify-center"
          style={{ left: "calc(20% - 27px)", top: "calc(45% + 28px)" }}
          aria-hidden
        >
          <div className="relative h-[82px] w-[80px] -scale-y-100 rotate-[-138.26deg] overflow-hidden">
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
