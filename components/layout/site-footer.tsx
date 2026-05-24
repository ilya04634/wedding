export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 py-8 text-center text-sm text-neutral-500">
      С любовью · {new Date().getFullYear()}
    </footer>
  );
}
