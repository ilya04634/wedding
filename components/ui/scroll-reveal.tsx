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
  fast: 320,
  medium: 560,
  smooth: 820,
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
  const isVisibleRef = useRef(isVisible);
  const frameRef = useRef<number | null>(null);
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
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  useEffect(() => {
    if (mode === "off") {
      setIsVisible(true);
      isVisibleRef.current = true;
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextVisible = entry.isIntersecting;

        if (mode === "once") {
          if (!nextVisible || isVisibleRef.current) return;
          setIsVisible(true);
          isVisibleRef.current = true;
          observer.disconnect();
          return;
        }

        if (nextVisible === isVisibleRef.current) return;

        if (frameRef.current !== null) {
          window.cancelAnimationFrame(frameRef.current);
        }

        frameRef.current = window.requestAnimationFrame(() => {
          isVisibleRef.current = nextVisible;
          setIsVisible(nextVisible);
          frameRef.current = null;
        });
      },
      options,
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
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
