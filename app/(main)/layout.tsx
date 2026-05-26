import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getSiteSettings } from "@/lib/google/settings";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <>
      <SiteHeader
        navTitle={settings.navTitle}
        uploadLinkEnabled={settings.uploadLinkEnabled}
        uploadLinkLabel={settings.uploadLinkLabel}
      />
      <main>{children}</main>
      <SiteFooter footerText={settings.footerText} />
    </>
  );
}
