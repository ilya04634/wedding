import type { Metadata, Viewport } from "next";
import { Caveat, Marck_Script, Montserrat, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
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
const marckScript = Marck_Script({
  subsets: ["cyrillic", "latin"],
  weight: "400",
  variable: "--font-marck-script",
  display: "swap",
});
const montserrat = Montserrat({
  subsets: ["cyrillic", "latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Приглашение на свадьбу",
  description: "Сайт-приглашение: программа, RSVP и загрузка фото",
  other: {
    "color-scheme": "light dark",
    "supported-color-schemes": "light dark",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: "#fdf5e0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${caveat.variable} ${marckScript.variable} ${montserrat.variable} min-h-screen bg-[#fdf5e0] font-[family-name:var(--font-montserrat)] text-[#4f5609] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
