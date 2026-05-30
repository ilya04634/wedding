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

const LABELS = [
  ["days", "дней"],
  ["hours", "часов"],
  ["minutes", "минут"],
  ["seconds", "секунд"],
] as const;

export function CountdownSection() {
  const [remaining, setRemaining] = useState(getRemainingTime);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemaining(getRemainingTime());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="wedding-paper relative isolate overflow-hidden px-4 py-20 text-center sm:px-8 sm:py-24">
      <Image
        src="/wedding-design/figma-dress-side-flower.png"
        alt=""
        width={736}
        height={1104}
        className="pointer-events-none absolute -right-9 top-12 z-0 w-36 opacity-90 mix-blend-multiply sm:right-[20%] sm:top-8 sm:w-52"
      />

      <div className="relative z-10 mx-auto max-w-3xl">
        <h2 className="font-script mx-auto max-w-[20rem] text-balance text-[4.4rem] leading-[0.82] text-[#397c57] sm:max-w-2xl sm:text-8xl">
          Мы скажем
          <span className="block">&quot;да&quot; через</span>
        </h2>

        <div className="mt-8 flex items-start justify-center gap-1 text-[#397c57] sm:mt-10 sm:gap-4">
          {LABELS.map(([key, label], index) => (
            <div key={key} className="flex items-start">
              <div className="w-[3.75rem] sm:w-32">
                <p className="font-display text-[2.75rem] leading-none tracking-[0.02em] sm:text-[5.6rem]">
                  {String(remaining[key]).padStart(2, "0")}
                </p>
                <p className="font-script mt-1 text-lg leading-none text-[#050500] sm:text-3xl">
                  {label}
                </p>
              </div>
              {index < LABELS.length - 1 ? (
                <span className="font-display mt-0 text-[2.55rem] leading-none sm:text-[5.2rem]">
                  :
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
