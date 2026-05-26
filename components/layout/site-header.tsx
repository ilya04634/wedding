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
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="mx-auto max-w-6xl rounded-full border border-[#8a9a7a]/20 bg-[#fdfbf7]/82 px-3 py-2 shadow-[0_14px_45px_rgba(52,49,45,0.08)] backdrop-blur-md">
        <nav className="flex items-center justify-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="flex min-h-10 min-w-0 items-center gap-2 rounded-full bg-white/55 px-4 text-sm font-semibold text-[#34312d] transition hover:bg-white/80"
          >
            <Heart className="h-4 w-4 shrink-0 text-[#e79796]" aria-hidden />
            <span className="truncate">{navTitle}</span>
          </Link>
          {uploadLinkEnabled ? (
            <Link
              href="/upload"
              className="flex min-h-10 min-w-0 items-center gap-2 rounded-full px-4 text-sm font-semibold text-[#6f7b62] transition hover:bg-white/65"
            >
              <Camera className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden min-[360px]:inline">{uploadLinkLabel}</span>
              <span className="min-[360px]:hidden">Медиа</span>
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
