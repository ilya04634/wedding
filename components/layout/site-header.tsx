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
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 text-sm font-medium text-neutral-900 transition-colors hover:text-neutral-600"
        >
          <Heart className="h-4 w-4" aria-hidden />
          <span className="truncate">{navTitle}</span>
        </Link>
        {uploadLinkEnabled ? (
          <nav>
            <Link
              href="/upload"
              className="flex min-h-10 items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              <Camera className="h-4 w-4" aria-hidden />
              <span className="hidden min-[360px]:inline">{uploadLinkLabel}</span>
            </Link>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
