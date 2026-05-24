import { UploadZone } from "@/components/upload/upload-zone";
import { Section } from "@/components/ui/section";

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-lg px-4 pb-16 pt-8">
      <Section
        title="Поделитесь вашими кадрами с нашего праздника!"
        description="Загрузите фото и видео с банкета — они попадут в общий альбом."
      >
        <UploadZone />
      </Section>
    </div>
  );
}
