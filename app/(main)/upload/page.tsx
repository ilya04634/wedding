import { UploadZone } from "@/components/upload/upload-zone";
import { Section } from "@/components/ui/section";
import { getSiteSettings } from "@/lib/google/settings";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const settings = await getSiteSettings();

  if (!settings.uploadLinkEnabled) {
    return (
      <div className="mx-auto max-w-2xl px-3 pb-14 pt-6 sm:px-4 sm:pb-16 sm:pt-8">
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
    <div className="mx-auto max-w-2xl px-3 pb-14 pt-6 sm:px-4 sm:pb-16 sm:pt-8">
      <Section
        title="Поделитесь вашими кадрами с нашего праздника!"
        description="Загрузите фото и видео с банкета — они попадут в общий альбом."
      >
        <UploadZone />
      </Section>
    </div>
  );
}
