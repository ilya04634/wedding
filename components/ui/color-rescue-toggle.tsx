"use client";

import { Palette } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "autoDarkFix";

function shouldShowToggle() {
  if (typeof window === "undefined") return false;

  const ua = window.navigator.userAgent || "";
  const isSamsung = /SamsungBrowser/i.test(ua);
  const isTelegram =
    /Telegram|TelegramBot|TgWebView/i.test(ua) ||
    Boolean(
      (window as Window & { Telegram?: unknown; TelegramWebviewProxy?: unknown })
        .Telegram ||
        (window as Window & { Telegram?: unknown; TelegramWebviewProxy?: unknown })
          .TelegramWebviewProxy,
    );
  const isDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  return isDark || isSamsung || isTelegram;
}

export function ColorRescueToggle() {
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => {
      setVisible(shouldShowToggle());
      setEnabled(document.documentElement.classList.contains("auto-dark-fix"));
    };

    sync();

    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    media?.addEventListener?.("change", sync);

    return () => media?.removeEventListener?.("change", sync);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      className="fixed bottom-3 right-3 z-[90] inline-flex min-h-10 items-center gap-2 rounded-full border border-[#4f5609]/20 bg-[#fbf3d9]/95 px-3 text-xs font-semibold text-[#4f5609] shadow-[0_14px_35px_rgba(52,49,45,0.16)] backdrop-blur-md"
      onClick={() => {
        const next = !enabled;
        document.documentElement.classList.toggle("auto-dark-fix", next);
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
        setEnabled(next);
      }}
    >
      <Palette className="h-4 w-4" aria-hidden />
      {enabled ? "Обычные цвета" : "Исправить цвета"}
    </button>
  );
}
