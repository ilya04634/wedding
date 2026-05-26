import { UploadZone } from "@/components/upload/upload-zone";
import { Section } from "@/components/ui/section";
import { getSiteSettings } from "@/lib/google/settings";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const settings = await getSiteSettings();

  if (!settings.uploadLinkEnabled) {
    return (
      <div className="relative isolate mx-auto max-w-2xl overflow-hidden px-3 pb-14 pt-6 sm:px-4 sm:pb-16 sm:pt-8">
        <div className="absolute -right-24 top-8 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(231,151,150,0.22),_rgba(231,151,150,0)_72%)]" />
        <div className="absolute -left-28 bottom-10 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(138,154,122,0.2),_rgba(138,154,122,0)_72%)]" />
        <Section
          title="Загрузка пока закрыта"
          description="Раздел для фото и видео появится в день праздника."
        >
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-center text-sm leading-6 text-neutral-600 sm:p-6">
            Когда загрузка будет открыта, ссылка появится на главной странице.
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div className="relative isolate mx-auto max-w-2xl overflow-hidden px-3 pb-14 pt-6 sm:px-4 sm:pb-16 sm:pt-8">
      <div className="absolute -right-24 top-8 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(231,151,150,0.22),_rgba(231,151,150,0)_72%)]" />
      <div className="absolute -left-28 bottom-10 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(138,154,122,0.2),_rgba(138,154,122,0)_72%)]" />
      <Section
        title="Поделитесь вашими кадрами с нашего праздника!"
        description="Загрузите фото и видео с банкета — они попадут в общий альбом."
      >
        <UploadZone />
      </Section>
    </div>
  );
}
