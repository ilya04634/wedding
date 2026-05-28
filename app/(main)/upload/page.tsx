import { UploadZone } from "@/components/upload/upload-zone";
import { getSiteSettings } from "@/lib/google/settings";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const settings = await getSiteSettings();

  if (!settings.uploadLinkEnabled) {
    return (
      <div className="relative isolate mx-auto max-w-2xl overflow-hidden px-3 pb-14 pt-6 sm:px-4 sm:pb-16 sm:pt-8">
        <section className="bg-[#fbf3d9] px-4 py-20 text-center text-[#4f5609]">
          <p className="font-script text-5xl leading-none text-[#6c7411]">
            Медиа
          </p>
          <h1 className="font-display mt-2 text-3xl uppercase tracking-[0.12em]">
            загрузка закрыта
          </h1>
          <p className="mx-auto mt-5 max-w-sm text-sm uppercase leading-5 tracking-[0.06em] text-[#4f5609]/70">
            Раздел для фото и видео появится в день праздника.
          </p>
          <div className="mx-auto mt-8 max-w-md border-y border-[#4f5609]/25 py-6 text-center text-sm leading-6 text-[#4f5609]/70">
            Когда загрузка будет открыта, ссылка появится на главной странице.
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="relative isolate mx-auto max-w-2xl overflow-hidden bg-[#fbf3d9] px-3 pb-14 pt-10 text-[#4f5609] sm:px-4 sm:pb-16 sm:pt-12">
      <section className="text-center">
        <p className="font-script text-5xl leading-none text-[#6c7411] sm:text-6xl">
          Наши кадры
        </p>
        <h1 className="font-display mt-2 text-3xl uppercase tracking-[0.12em] sm:text-4xl">
          фото и видео
        </h1>
        <p className="mx-auto mt-5 max-w-sm text-sm uppercase leading-5 tracking-[0.06em] text-[#4f5609]/70">
          Загрузите фото и видео с банкета - они попадут в общий альбом.
        </p>
        <div className="mt-8">
          <UploadZone />
        </div>
      </section>
    </div>
  );
}

