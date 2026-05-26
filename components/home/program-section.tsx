import { PROGRAM_ITEMS } from "@/lib/constants/wedding";
import { Section } from "@/components/ui/section";
import { Clock } from "lucide-react";

export function ProgramSection() {
  return (
    <Section
      id="program"
      title="Программа дня"
      description="Основные моменты дня. Если детали изменятся, мы сообщим гостям заранее."
    >
      <ol className="space-y-0">
        {PROGRAM_ITEMS.map((item) => (
          <li
            key={item.time}
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
