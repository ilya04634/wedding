import type { Metadata, Viewport } from "next";
import { ColorRescueToggle } from "@/components/ui/color-rescue-toggle";
import { Caveat, Montserrat, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const playfair = Playfair_Display({
  subsets: ["cyrillic", "latin"],
  variable: "--font-playfair",
  display: "swap",
});
const caveat = Caveat({
  subsets: ["cyrillic", "latin"],
  variable: "--font-caveat",
  display: "swap",
});
const montserrat = Montserrat({
  subsets: ["cyrillic", "latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const autoDarkFixScript = `
(() => {
  try {
    const ua = navigator.userAgent || "";
    const isSamsung = /SamsungBrowser/i.test(ua);
    const isTelegram =
      /Telegram|TelegramBot|TgWebView/i.test(ua) ||
      Boolean(window.Telegram || window.TelegramWebviewProxy);
    const isDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const params = new URLSearchParams(window.location.search);
    const forced = params.has("autoDarkFix");
    const stored =
      window.localStorage &&
      window.localStorage.getItem("autoDarkFix");

    if (stored === "1" || forced || (!stored && isDark && (isSamsung || isTelegram))) {
      document.documentElement.classList.add("auto-dark-fix");
    }
  } catch {
    // If browser APIs are unavailable, keep the normal light theme.
  }
})();
`;

export const metadata: Metadata = {
  title: "Приглашение на свадьбу",
  description: "Сайт-приглашение: программа, RSVP и загрузка фото",
  other: {
    "color-scheme": "only light",
    "supported-color-schemes": "light",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#fbf3d9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${caveat.variable} ${montserrat.variable} min-h-screen bg-[#fbf3d9] font-[family-name:var(--font-montserrat)] text-[#4f5609] antialiased`}
      >
        <Script
          id="auto-dark-fix"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: autoDarkFixScript }}
        />
        {children}
        <ColorRescueToggle />
      </body>
    </html>
  );
}
