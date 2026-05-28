"use client";

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
    <section className="scroll-reveal px-4 py-12 sm:px-8 sm:py-16">
      <div className="relative mx-auto max-w-5xl overflow-hidden bg-[#fbf3d9] px-3 py-10 text-center sm:px-10 sm:py-16">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(231,151,150,0.14),_rgba(231,151,150,0)_70%)]" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <h2 className="font-script mx-auto max-w-3xl text-balance text-[3.4rem] leading-[0.82] text-[#6c7411] sm:text-7xl lg:text-8xl">
            Мы скажем
            <span className="block">&quot;да&quot; через</span>
          </h2>

          <div className="mt-8 flex items-start justify-center gap-1 text-[#6c7411] sm:mt-10 sm:gap-3">
            {LABELS.map(([key, label], index) => (
              <div key={key} className="flex items-start">
                <div className="w-[4.4rem] sm:w-32 lg:w-40">
                  <p className="font-display text-[3rem] font-medium leading-none tracking-[0.02em] sm:text-[5.8rem] lg:text-[7.2rem]">
                    {String(remaining[key]).padStart(2, "0")}
                  </p>
                  <p className="font-script mt-1 text-xl leading-none text-[#4f5609] sm:text-3xl">
                    {label}
                  </p>
                </div>
                {index < LABELS.length - 1 ? (
                  <span className="font-display mt-1 text-[2.6rem] leading-none sm:mt-2 sm:text-[5.4rem] lg:text-[6.6rem]">
                    :
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

