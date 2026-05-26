import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionProps {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Section({
  id,
  title,
  description,
  children,
  className,
}: SectionProps) {
  return (
    <section id={id} className={cn("scroll-mt-24", className)}>
      <header className="mb-7 text-center">
        <h2 className="font-display text-4xl text-[#34312d] sm:text-5xl">
          {title}
        </h2>
        {description ? (
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#746f66]">
            {description}
          </p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
