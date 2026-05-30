import { WishWall } from "@/components/wishes/wish-wall";
import type { SiteSettings } from "@/types/settings";
import { MessageCircleHeart } from "lucide-react";

interface WishWallSectionProps {
  guestName?: string;
  settings: SiteSettings;
}

export function WishWallSection({ guestName, settings }: WishWallSectionProps) {
  return (
    <section className="px-4 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-5xl rounded-3xl border border-[#f4d03f]/35 bg-[#fff9db]/70 p-6 text-center shadow-[0_14px_38px_rgba(52,49,45,0.045)] sm:rounded-[2rem] sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/70 text-[#8a9a7a] shadow-sm">
          <MessageCircleHeart className="h-7 w-7" aria-hidden />
        </div>
        <p className="mt-5 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#8a9a7a] sm:text-xs sm:tracking-[0.24em]">
          Wish wall
        </p>
        <h2 className="font-display mt-3 text-3xl leading-tight text-[#4f5609] sm:text-5xl">
          Стена пожеланий
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#746f66]">
          Оставьте пару теплых слов для Ильи и Даши. Пожелания появятся на
          общей доске как маленькие открытки.
        </p>
        <WishWall
          density={settings.wishWallDensity}
          initialGuestName={guestName}
          layout={settings.wishWallLayout}
          maxTilt={settings.wishWallMaxTilt}
          overlap={settings.wishWallOverlap}
        />
      </div>
    </section>
  );
}

