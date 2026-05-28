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
    <section className="px-4 py-12 sm:px-8 sm:py-16">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[#8a9a7a]/18 bg-[#fdfbf7] px-5 py-10 text-center shadow-[0_22px_70px_rgba(52,49,45,0.07)] sm:px-10 sm:py-14">
        <div className="absolute -left-20 top-4 h-44 w-44 rounded-full bg-[radial-gradient(circle,_rgba(244,208,63,0.22),_rgba(244,208,63,0)_70%)]" />
        <div className="absolute -right-20 bottom-0 h-52 w-52 rounded-full bg-[radial-gradient(circle,_rgba(231,151,150,0.22),_rgba(231,151,150,0)_70%)]" />
        <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(138,154,122,0.13),_rgba(138,154,122,0)_70%)]" />

        <div className="relative z-10">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#8a9a7a] sm:text-xs">
            Countdown
          </p>
          <h2 className="font-display mt-3 text-3xl leading-tight text-[#34312d] sm:text-5xl">
            Мы скажем да через
          </h2>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {LABELS.map(([key, label], index) => (
              <div
                key={key}
                className="rounded-3xl border border-white/70 bg-white/58 px-3 py-5 shadow-[0_14px_40px_rgba(52,49,45,0.05)] backdrop-blur-sm"
              >
                <p
                  className="font-display text-4xl font-semibold leading-none sm:text-5xl"
                  style={{
                    color:
                      index === 1
                        ? "#e79796"
                        : index === 2
                          ? "#c9ab21"
                          : "#8a9a7a",
                  }}
                >
                  {String(remaining[key]).padStart(2, "0")}
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#746f66]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
