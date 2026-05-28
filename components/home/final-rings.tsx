import { RingsLineArt } from "@/components/home/line-art";
import type { SiteSettings } from "@/types/settings";

interface FinalRingsProps {
  settings: SiteSettings;
}

export function FinalRings({ settings }: FinalRingsProps) {
  return (
    <footer className="px-4 pb-12 pt-2 text-center sm:px-8 sm:pb-14">
      <RingsLineArt className="mx-auto h-20 w-full max-w-60 text-[#6c7411] sm:h-24 sm:max-w-72" />
      <p className="font-script mt-2 text-3xl text-[#4f5609] sm:text-4xl">
        {settings.coupleNames}
      </p>
      <p className="mt-2 text-sm text-[#746f66]">{settings.footerText}</p>
    </footer>
  );
}

