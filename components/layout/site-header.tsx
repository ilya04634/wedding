import Link from "next/link";
import { Camera, Heart } from "lucide-react";

interface SiteHeaderProps {
  navTitle: string;
  uploadLinkEnabled: boolean;
  uploadLinkLabel: string;
}

export function SiteHeader({
  navTitle,
  uploadLinkEnabled,
  uploadLinkLabel,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 px-2 pt-3 sm:px-6 sm:pt-4">
      <div className="mx-auto max-w-6xl rounded-full border border-[#4f5609]/15 bg-[#fbf3d9]/88 px-2 py-2 shadow-[0_14px_45px_rgba(52,49,45,0.06)] backdrop-blur-md sm:px-3">
        <nav className="flex items-center justify-center gap-1.5 sm:gap-3">
          <Link
            href="/"
            className="flex min-h-10 min-w-0 items-center gap-2 rounded-full bg-white/35 px-3 text-sm font-semibold text-[#4f5609] transition hover:bg-white/70 sm:px-4"
          >
            <Heart className="h-4 w-4 shrink-0 text-[#6c7411]" aria-hidden />
            <span className="truncate">{navTitle}</span>
          </Link>
          {uploadLinkEnabled ? (
            <Link
              href="/upload"
              className="flex min-h-10 min-w-0 items-center gap-2 rounded-full px-3 text-xs font-semibold text-[#4f5609]/75 transition hover:bg-white/55 min-[420px]:text-sm sm:px-4"
            >
              <Camera className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden whitespace-nowrap min-[360px]:inline">
                {uploadLinkLabel}
              </span>
              <span className="min-[360px]:hidden">Медиа</span>
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

