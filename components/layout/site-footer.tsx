interface SiteFooterProps {
  footerText: string;
}

export function SiteFooter({ footerText }: SiteFooterProps) {
  return (
    <footer className="border-t border-neutral-200 py-8 text-center text-sm text-neutral-500">
      {footerText} · {new Date().getFullYear()}
    </footer>
  );
}
