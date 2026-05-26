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
    <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-neutral-900 transition-colors hover:text-neutral-600"
        >
          <Heart className="h-4 w-4" aria-hidden />
          {navTitle}
        </Link>
        {uploadLinkEnabled ? (
          <nav>
            <Link
              href="/upload"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              <Camera className="h-4 w-4" aria-hidden />
              {uploadLinkLabel}
            </Link>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
