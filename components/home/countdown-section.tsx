"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const TARGET_TIME = new Date("2026-07-21T14:00:00+06:00").getTime();

function getRemainingTime() {
  const diff = Math.max(0, TARGET_TIME - Date.now());
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);

  return { days, hours, minutes, seconds };
}

const labels = ["дней", "часов", "минут", "секунд"];

export function CountdownSection() {
  const [remaining, setRemaining] = useState(getRemainingTime);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemaining(getRemainingTime());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const values = [
    remaining.days,
    remaining.hours,
    remaining.minutes,
    remaining.seconds,
  ].map((value) => String(value).padStart(2, "0"));

  return (
    <section
      id="dress-code"
      className="figma-frame-section figma-frame-section--countdown scroll-mt-24"
    >
      <div className="figma-phone-frame text-black">
        <Image
          src="/figma-export/images/node-2.png"
          alt=""
          width={163}
          height={247}
          className="absolute left-[-35px] top-[-53px] h-[247px] w-[163px] object-bottom"
          aria-hidden
        />

        <p
          className="absolute whitespace-nowrap font-display text-[32px] uppercase leading-none tracking-[0.64px] text-black"
          style={{ left: "calc(45% - 92.9px)", top: "calc(10% + 4.9px)" }}
        >
          Дресс-код
        </p>
        <p
          className="absolute whitespace-nowrap font-figma-script text-[48px] leading-none text-[#397c57]"
          style={{ left: "calc(40% - 0.8px)", top: "calc(15% + 0.35px)" }}
        >
          dress-code
        </p>
        <p
          className="absolute w-[253px] whitespace-pre-wrap font-display text-[18px] uppercase leading-[1.14] tracking-[0.3px] text-black"
          style={{ left: "calc(50% - 112px)", top: "calc(20% + 21.8px)" }}
        >
          Приходите красивые и счастливые
        </p>

        <Image
          src="/figma-export/images/vector-27-9.svg"
          alt=""
          width={102}
          height={14}
          className="absolute h-[14px] w-[102px]"
          style={{ left: "calc(40% + 7.2px)", top: "calc(31% + 2px)" }}
          aria-hidden
        />
        {[
          {
            src: "/figma-wedding/dress-mini-1.svg",
            style: {
              left: "calc(50% - 16.44px)",
              top: "calc(31% - 15px)",
              width: "13.44px",
              height: "17.998px",
            },
          },
          {
            src: "/figma-wedding/dress-mini-2.svg",
            style: {
              left: "calc(50% + 5.54px)",
              top: "calc(31% - 15px)",
              width: "15.019px",
              height: "24.001px",
            },
          },
          {
            src: "/figma-wedding/dress-mini-3.svg",
            style: {
              left: "calc(60% - 13.08px)",
              top: "calc(31% - 13px)",
              width: "15.019px",
              height: "24.001px",
            },
          },
          {
            src: "/figma-wedding/dress-mini-4.svg",
            style: {
              left: "calc(60% + 13.13px)",
              top: "calc(31% - 16px)",
              width: "15.019px",
              height: "24.001px",
            },
          },
        ].map((item) => (
          <div
            key={item.src}
            className="absolute"
            style={item.style}
            aria-hidden
          >
            <Image src={item.src} alt="" fill className="object-contain" />
          </div>
        ))}

        <p
          className="absolute w-[265px] text-center font-readable-script text-[48px] leading-[0.89] text-[#397c57]"
          style={{
            left: "calc(20% + 108.1px)",
            top: "calc(42% + 0px)",
            transform: "translateX(-50%)",
          }}
        >
          Мы скажем “да” через
        </p>
        <div
          className="absolute grid w-[288px] grid-cols-[58px_18px_58px_18px_58px_18px_58px] items-start text-center font-poltawski text-[48px] uppercase leading-[1.082] text-[#397c57]"
          style={{ left: "calc(50% - 144px)", top: "calc(52% + 0px)" }}
        >
          <span>{values[0]}</span>
          <span>:</span>
          <span>{values[1]}</span>
          <span>:</span>
          <span>{values[2]}</span>
          <span>:</span>
          <span>{values[3]}</span>
        </div>
        <div
          className="absolute grid w-[280px] grid-cols-4 text-center font-readable-script text-[16px] leading-none text-black"
          style={{ left: "calc(50% - 140px)", top: "calc(57% + 4px)" }}
        >
          {labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <Image
          src="/figma-export/images/line-1-44.svg"
          alt=""
          width={60}
          height={1}
          className="absolute h-px w-[60px]"
          style={{ left: "calc(30% - 22.6px)", top: "calc(20% - 13.2px)" }}
          aria-hidden
        />
        <Image
          src="/figma-export/images/node-45.png"
          alt=""
          width={175}
          height={262}
          className="absolute h-[262px] w-[175px] object-cover"
          style={{ left: "calc(60% + 23.8px)", top: "calc(34% + 8px)" }}
          aria-hidden
        />
      </div>
    </section>
  );
}
