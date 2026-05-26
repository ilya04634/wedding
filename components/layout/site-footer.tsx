interface SiteFooterProps {
  footerText: string;
}

export function SiteFooter({ footerText }: SiteFooterProps) {
  return (
    <footer className="border-t border-neutral-200 px-4 py-7 text-center text-sm leading-6 text-neutral-500">
      {footerText} · {new Date().getFullYear()}
    </footer>
  );
}
