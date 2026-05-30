import type { SiteSettings } from "@/types/settings";
import Image from "next/image";

interface HeroSectionProps {
  guestName?: string;
  settings: SiteSettings;
}

export function HeroSection({ guestName, settings }: HeroSectionProps) {
  const eyebrow = guestName
    ? settings.heroPersonalEyebrowTemplate.replaceAll("{{guestName}}", guestName)
    : settings.heroDefaultEyebrow;

  return (
    <section className="wedding-paper relative isolate min-h-[calc(100svh-57px)] overflow-hidden px-3 py-9 text-center sm:min-h-[calc(100svh-65px)] sm:px-8 sm:py-16 lg:py-20">
      <Image
        src="/wedding-design/wildflowers-wide.png"
        alt=""
        width={740}
        height={423}
        className="pointer-events-none absolute -right-12 top-12 z-0 w-44 opacity-90 mix-blend-multiply sm:-right-8 sm:top-8 sm:w-72 lg:right-2 lg:top-10 lg:w-80"
      />
      <Image
        src="/wedding-design/wildflowers-stem.png"
        alt=""
        width={600}
        height={900}
        className="pointer-events-none absolute -bottom-12 -left-16 z-0 w-44 rotate-[-14deg] opacity-75 mix-blend-multiply sm:w-64"
      />
      <div className="absolute -left-32 top-8 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(138,154,122,0.18),_rgba(138,154,122,0)_70%)] sm:h-96 sm:w-96" />
      <div className="absolute -right-28 top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(231,151,150,0.13),_rgba(231,151,150,0)_70%)] sm:-right-20 sm:top-16 sm:h-[32rem] sm:w-[32rem]" />

      <div className="garden-fade relative z-10 mx-auto flex max-w-5xl flex-col items-center">
        <p className="max-w-full border-y border-[#3f8059]/40 px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#3f8059] sm:px-4 sm:text-xs sm:tracking-[0.22em]">
          {eyebrow}
        </p>

        <div className="mt-7 max-w-full sm:mt-8">
          <p className="font-display paper-ink text-[2.45rem] font-semibold uppercase tracking-[0.2em] sm:text-6xl sm:tracking-[0.28em]">
            {settings.heroFamilyName}
          </p>
          <h1 className="font-script paper-green mt-1 text-balance text-[4.15rem] leading-[0.86] sm:text-8xl lg:text-9xl">
            {settings.coupleNames}
          </h1>
        </div>

        <p className="font-display paper-ink mx-auto mt-5 max-w-2xl text-balance text-2xl leading-tight sm:text-4xl lg:text-5xl">
          {settings.heroSubtitle}
        </p>
        <p className="mx-auto mt-5 max-w-2xl text-balance text-[0.95rem] leading-7 text-[#3d361f]/75 sm:mt-6 sm:text-lg sm:leading-8">
          {settings.heroText}
        </p>

        <div className="relative mt-10 w-full max-w-[24rem] pb-6 text-[#050500] sm:mt-14 sm:max-w-3xl sm:pb-10">
          <div className="relative mx-auto h-[27rem] max-w-sm sm:h-[32rem] sm:max-w-xl">
            <Image
              src="/wedding-design/figma-venue-photo.png"
              alt=""
              width={1440}
              height={1800}
              priority
              className="absolute right-0 top-16 h-[19rem] w-[16rem] object-cover shadow-[0_20px_45px_rgba(52,49,45,0.16)] sm:h-[25rem] sm:w-[20rem]"
            />

            <div className="paper-card absolute left-1 top-2 w-[16rem] rotate-[-5deg] !bg-[#fffaf0] px-6 py-8 text-center shadow-[0_20px_45px_rgba(52,49,45,0.13)] sm:left-6 sm:w-[20rem] sm:px-8 sm:py-10">
              <p className="font-script text-3xl leading-none text-[#050500] sm:text-4xl">
                место проведения
              </p>
              <p className="font-display mt-2 text-3xl uppercase leading-none tracking-[0.02em] text-[#397c57] sm:text-5xl">
                Ресторан
              </p>
              <p className="font-display text-[1.7rem] leading-none text-[#397c57] sm:text-4xl">
                {settings.weddingVenue}
              </p>
              <p className="mt-6 font-display text-base leading-6 text-[#050500] sm:text-lg">
                по адресу
                <span className="block">{settings.weddingAddressLine}</span>
              </p>
              <a
                href={settings.weddingMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex min-h-10 items-center justify-center bg-[#397c57] px-6 font-display text-sm lowercase tracking-[0.03em] text-[#fffaf0] shadow-[0_12px_24px_rgba(57,124,87,0.2)] transition hover:-translate-y-0.5 hover:bg-[#2f6849]"
              >
                посмотреть маршрут
              </a>
            </div>
          </div>

          <div className="relative mx-auto -mt-1 max-w-sm text-center sm:-mt-4">
            <p className="font-script text-4xl leading-none text-[#397c57]">
              июль 2026
            </p>
            <div className="relative mt-5 flex items-center justify-between font-display text-4xl tracking-[0.02em] text-[#193726]">
              {["19", "20", "21", "22", "23"].map((day) => (
                <span key={day} className="relative z-10 w-12">
                  {day}
                </span>
              ))}
              <Image
                src="/wedding-design/figma-date-heart.png"
                alt=""
                width={736}
                height={736}
                className="pointer-events-none absolute left-1/2 top-1/2 z-0 w-20 -translate-x-1/2 -translate-y-1/2 opacity-80 mix-blend-multiply"
              />
            </div>
            <p className="font-script mt-4 text-3xl leading-none text-[#397c57]">
              вторник
            </p>
            <p className="font-display mx-auto mt-7 max-w-xs text-base leading-6 tracking-[0.02em] text-[#397c57]">
              Надеемся, что вы примете наше приглашение, будем вас ждать!
            </p>
          </div>
        </div>

        <a
          href="#rsvp"
          className="mt-9 inline-flex min-h-12 w-full max-w-sm items-center justify-center bg-[#3f8059] px-6 py-4 font-display text-sm font-bold uppercase tracking-[0.08em] text-[#fbf3d9] shadow-[0_16px_35px_rgba(63,128,89,0.2)] transition hover:-translate-y-0.5 hover:bg-[#326a49] sm:mt-10 sm:w-auto sm:px-8"
        >
          Подтвердить присутствие
        </a>
      </div>
    </section>
  );
}
