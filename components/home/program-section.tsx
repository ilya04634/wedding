import { Section } from "@/components/ui/section";
import type { SiteSettings } from "@/types/settings";
import { Clock } from "lucide-react";

interface ProgramSectionProps {
  settings: SiteSettings;
}

export function ProgramSection({ settings }: ProgramSectionProps) {
  return (
    <Section
      id="program"
      title={settings.programTitle}
      description={settings.programDescription}
    >
      <ol className="space-y-0">
        {settings.programItems.map((item) => (
          <li
            key={`${item.time}-${item.title}`}
            className="relative flex gap-4 border-l border-neutral-200 pb-8 pl-6 last:pb-0"
          >
            <span
              className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-neutral-400 ring-1 ring-neutral-200"
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-neutral-500">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {item.time}
              </p>
              <h3 className="mt-1 font-medium text-neutral-900">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-neutral-600">{item.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
