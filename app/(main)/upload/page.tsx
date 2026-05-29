import { UploadZone } from "@/components/upload/upload-zone";
import { getSiteSettings } from "@/lib/google/settings";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const settings = await getSiteSettings();

  if (!settings.uploadLinkEnabled) {
    return (
      <div className="wedding-paper relative isolate min-h-[100dvh] overflow-hidden px-3 pb-14 pt-6 sm:px-4 sm:pb-16 sm:pt-8">
        <Image
          src="/wedding-design/wildflowers-wide.png"
          alt=""
          width={740}
          height={423}
          className="pointer-events-none absolute right-0 top-0 w-56 opacity-85 mix-blend-multiply"
        />
        <section className="mx-auto max-w-2xl px-4 py-20 text-center text-[#24340d]">
          <p className="font-script text-5xl leading-none text-[#3f8059]">
            Медиа
          </p>
          <h1 className="font-display mt-2 text-3xl uppercase tracking-[0.12em]">
            загрузка закрыта
          </h1>
          <p className="mx-auto mt-5 max-w-sm text-sm uppercase leading-5 tracking-[0.06em] text-[#24340d]/70">
            Раздел для фото и видео появится в день праздника.
          </p>
          <div className="mx-auto mt-8 max-w-md border-y border-[#3f8059]/35 py-6 text-center text-sm leading-6 text-[#24340d]/70">
            Когда загрузка будет открыта, ссылка появится на главной странице.
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="wedding-paper relative isolate min-h-[100dvh] overflow-hidden px-3 pb-14 pt-10 text-[#24340d] sm:px-4 sm:pb-16 sm:pt-12">
      <Image
        src="/wedding-design/wildflowers-wide.png"
        alt=""
        width={740}
        height={423}
        className="pointer-events-none absolute right-0 top-0 w-56 opacity-85 mix-blend-multiply sm:w-72"
      />
      <Image
        src="/wedding-design/wildflowers-stem.png"
        alt=""
        width={600}
        height={900}
        className="pointer-events-none absolute -bottom-10 -left-12 w-44 rotate-[-12deg] opacity-80 mix-blend-multiply sm:w-60"
      />
      <section className="relative z-10 mx-auto max-w-2xl text-center">
        <p className="font-script text-5xl leading-none text-[#3f8059] sm:text-6xl">
          Наши кадры
        </p>
        <h1 className="font-display mt-2 text-3xl uppercase tracking-[0.12em] sm:text-4xl">
          фото и видео
        </h1>
        <p className="mx-auto mt-5 max-w-sm text-sm uppercase leading-5 tracking-[0.06em] text-[#24340d]/70">
          Загрузите фото и видео с банкета - они попадут в общий альбом.
        </p>
        <div className="paper-card mt-8 p-4 text-left sm:p-6">
          <UploadZone />
        </div>
      </section>
    </div>
  );
}
