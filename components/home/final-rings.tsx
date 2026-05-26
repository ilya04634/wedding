import { RingsLineArt } from "@/components/home/line-art";
import type { SiteSettings } from "@/types/settings";

interface FinalRingsProps {
  settings: SiteSettings;
}

export function FinalRings({ settings }: FinalRingsProps) {
  return (
    <footer className="px-4 pb-14 pt-4 text-center sm:px-8">
      <RingsLineArt className="mx-auto h-24 w-full max-w-72 text-[#e79796]" />
      <p className="font-script mt-2 text-4xl text-[#34312d]">
        {settings.coupleNames}
      </p>
      <p className="mt-2 text-sm text-[#746f66]">{settings.footerText}</p>
    </footer>
  );
}
