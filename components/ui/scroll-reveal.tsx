"use client";

import { cn } from "@/lib/utils";
import type {
  RevealAnimationMode,
  RevealAnimationSpeed,
  RevealAnimationTrigger,
} from "@/types/settings";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  distance: number;
  mode: RevealAnimationMode;
  speed: RevealAnimationSpeed;
  trigger: RevealAnimationTrigger;
}

const SPEED_MS: Record<RevealAnimationSpeed, number> = {
  fast: 450,
  medium: 750,
  smooth: 1050,
};

const TRIGGER_OPTIONS: Record<
  RevealAnimationTrigger,
  { rootMargin: string; threshold: number }
> = {
  early: { rootMargin: "0px 0px -4% 0px", threshold: 0.08 },
  medium: { rootMargin: "0px 0px -14% 0px", threshold: 0.16 },
  late: { rootMargin: "0px 0px -28% 0px", threshold: 0.24 },
};

export function ScrollReveal({
  children,
  className,
  distance,
  mode,
  speed,
  trigger,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(mode === "off");
  const options = TRIGGER_OPTIONS[trigger] ?? TRIGGER_OPTIONS.medium;
  const style = useMemo(
    () =>
      ({
        "--reveal-distance": `${Math.max(0, distance)}px`,
        "--reveal-duration": `${SPEED_MS[speed] ?? SPEED_MS.smooth}ms`,
      }) as CSSProperties,
    [distance, speed],
  );

  useEffect(() => {
    if (mode === "off") {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (mode === "once") {
          if (!entry.isIntersecting) return;
          setIsVisible(true);
          observer.disconnect();
          return;
        }

        setIsVisible(entry.isIntersecting);
      },
      options,
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [mode, options]);

  return (
    <div
      ref={ref}
      className={cn(
        mode !== "off" && "scroll-reveal",
        isVisible && "is-visible",
        className,
      )}
      style={mode === "off" ? undefined : style}
    >
      {children}
    </div>
  );
}
