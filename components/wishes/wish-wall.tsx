"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { WishWallDensity, WishWallLayout } from "@/types/settings";
import type { WeddingWish } from "@/types/wish";
import { Loader2, Send, Sparkles } from "lucide-react";
import {
  CSSProperties,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type WishCardStyle = {
  backgroundColor: string;
  height: number;
  rotate: number;
  width: number;
  x: number;
  y: number;
};

type WishWallTuning = {
  density: WishWallDensity;
  maxTilt: number;
  overlap: number;
};

const NOTE_COLORS = [
  "rgba(231, 151, 150, 0.36)",
  "rgba(138, 154, 122, 0.28)",
  "rgba(244, 208, 63, 0.34)",
  "rgba(255, 249, 219, 0.78)",
];

function hashText(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function randomUnit(seed: number): number {
  let value = seed + 0x6d2b79f5;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getDensityRatio(density: WishWallDensity) {
  if (density === "airy") return 0.48;
  if (density === "compact") return 0.74;
  return 0.62;
}

function getSpacingClass(density: WishWallDensity) {
  if (density === "airy") return "gap-5";
  if (density === "compact") return "gap-2";
  return "gap-3";
}

function estimateCardHeight(wishText: string, width: number) {
  const charsPerLine = Math.max(12, Math.floor(width / 13));
  const lineCount = Math.ceil(wishText.length / charsPerLine);
  return Math.min(256, Math.max(128, 72 + lineCount * 31));
}

function overlapsTooMuch(
  candidate: { x: number; y: number; width: number; height: number },
  placed: Array<{ x: number; y: number; width: number; height: number }>,
  maxOverlap: number,
) {
  return placed.some((card) => {
    const overlapX =
      Math.min(candidate.x + candidate.width, card.x + card.width) -
      Math.max(candidate.x, card.x);
    const overlapY =
      Math.min(candidate.y + candidate.height, card.y + card.height) -
      Math.max(candidate.y, card.y);

    if (overlapX <= 0 || overlapY <= 0) return false;

    const allowedX = Math.min(
      maxOverlap * 1.4,
      Math.min(candidate.width, card.width) * (0.05 + maxOverlap / 180),
    );
    const allowedY = Math.min(
      maxOverlap,
      Math.min(candidate.height, card.height) * (0.04 + maxOverlap / 220),
    );

    return overlapX > allowedX && overlapY > allowedY;
  });
}

function getCardStyles(
  wishes: WeddingWish[],
  boardWidth: number,
  tuning: WishWallTuning,
) {
  const safeBoardWidth = Math.max(280, boardWidth || 560);
  const isCompact = safeBoardWidth < 520;
  const cardWidth = isCompact
    ? Math.min(170, Math.max(136, safeBoardWidth * 0.46))
    : Math.min(214, Math.max(178, safeBoardWidth * 0.29));
  const padding = isCompact ? 14 : 20;
  const minBoardHeight = isCompact ? 544 : 640;
  const densityRatio = getDensityRatio(tuning.density);
  const maxOverlap = clamp(tuning.overlap, 0, 36);
  const maxTilt = clamp(tuning.maxTilt, 0, 10);
  const estimatedArea = wishes.reduce(
    (total, wish) => total + cardWidth * estimateCardHeight(wish.wishText, cardWidth),
    0,
  );
  const initialSearchHeight = Math.max(
    minBoardHeight,
    Math.ceil(estimatedArea / (safeBoardWidth * densityRatio)),
  );
  const placed: WishCardStyle[] = [];

  wishes.forEach((wish, index) => {
    const hash = hashText(`${wish.id}-${wish.guestName}-${wish.wishText}`);
    const height = estimateCardHeight(wish.wishText, cardWidth);
    const maxX = Math.max(padding, safeBoardWidth - cardWidth - padding);
    let searchHeight = initialSearchHeight;
    let selected: WishCardStyle | null = null;

    for (let attempt = 0; attempt < 260; attempt += 1) {
      if (attempt > 0 && attempt % 45 === 0) {
        searchHeight += isCompact ? 130 : 115;
      }

      const x = padding + randomUnit(hash + attempt * 97) * (maxX - padding);
      const y =
        padding +
        randomUnit(hash + attempt * 193 + index * 31) *
          Math.max(1, searchHeight - height - padding);
      const candidate = {
        backgroundColor: NOTE_COLORS[hash % NOTE_COLORS.length],
        height,
        rotate: Math.round((randomUnit(hash + 811) * 2 - 1) * maxTilt),
        width: cardWidth,
        x,
        y,
      };

      if (!overlapsTooMuch(candidate, placed, maxOverlap)) {
        selected = candidate;
        break;
      }
    }

    if (!selected) {
      const row = Math.floor(index / (isCompact ? 2 : 3));
      selected = {
        backgroundColor: NOTE_COLORS[hash % NOTE_COLORS.length],
        height,
        rotate: Math.round((randomUnit(hash + 811) * 2 - 1) * maxTilt),
        width: cardWidth,
        x:
          padding +
          (index % (isCompact ? 2 : 3)) *
            ((safeBoardWidth - cardWidth - padding * 2) /
              Math.max(1, (isCompact ? 2 : 3) - 1)),
        y: padding + row * (height - 22),
      };
    }

    placed.push(selected);
  });

  return placed;
}

function getBoardHeight(cardStyles: WishCardStyle[], boardWidth: number) {
  const minBoardHeight = boardWidth < 520 ? 544 : 640;
  const maxBottom = cardStyles.reduce(
    (max, card) => Math.max(max, card.y + card.height),
    0,
  );

  return Math.max(minBoardHeight, Math.ceil(maxBottom + 36));
}

function getCardBaseStyle(
  wish: WeddingWish,
  maxTilt = 5,
): Pick<WishCardStyle, "backgroundColor" | "rotate"> {
  const hash = hashText(`${wish.id}-${wish.guestName}-${wish.wishText}`);
  return {
    backgroundColor: NOTE_COLORS[hash % NOTE_COLORS.length],
    rotate: Math.round((randomUnit(hash + 811) * 2 - 1) * clamp(maxTilt, 0, 10)),
  };
}

interface WishWallProps {
  density: WishWallDensity;
  initialGuestName?: string;
  layout: WishWallLayout;
  maxTilt: number;
  overlap: number;
}

export function WishWall({
  density,
  initialGuestName,
  layout,
  maxTilt,
  overlap,
}: WishWallProps) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [boardWidth, setBoardWidth] = useState(0);
  const [wishes, setWishes] = useState<WeddingWish[]>([]);
  const [guestName, setGuestName] = useState(initialGuestName ?? "");
  const [wishText, setWishText] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [liftedZ, setLiftedZ] = useState<Record<string, number>>({});
  const [nextZ, setNextZ] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadWishes() {
      try {
        const response = await fetch("/api/wishes", { cache: "no-store" });
        const data = (await response.json()) as {
          wishes?: WeddingWish[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error || "Не удалось загрузить пожелания");
        }

        if (!cancelled) {
          setWishes(data.wishes ?? []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Не удалось загрузить пожелания",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadWishes();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!guestName.trim() && initialGuestName) {
      setGuestName(initialGuestName);
    }
  }, [guestName, initialGuestName]);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    function syncWidth() {
      setBoardWidth(board?.clientWidth ?? 0);
    }

    syncWidth();
    const observer = new ResizeObserver(syncWidth);
    observer.observe(board);

    return () => observer.disconnect();
  }, []);

  const cardStyles = useMemo(
    () => getCardStyles(wishes, boardWidth, { density, maxTilt, overlap }),
    [boardWidth, density, maxTilt, overlap, wishes],
  );
  const boardHeight = getBoardHeight(cardStyles, boardWidth);

  function liftCard(id: string) {
    setActiveId(id);
    setLiftedZ((current) => ({ ...current, [id]: nextZ }));
    setNextZ((value) => value + 1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedName = guestName.trim();
    const normalizedWish = wishText.trim();

    if (!normalizedName || !normalizedWish) {
      setError("Заполните имя и пожелание.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: normalizedName,
          wishText: normalizedWish,
        }),
      });
      const data = (await response.json()) as {
        wish?: WeddingWish;
        error?: string;
      };

      if (!response.ok || !data.wish) {
        throw new Error(data.error || "Не удалось сохранить пожелание");
      }

      setWishes((current) => [...current, data.wish as WeddingWish]);
      setGuestName(initialGuestName ?? "");
      setWishText("");
      liftCard(data.wish.id);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Не удалось сохранить пожелание",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderNote(
    wish: WeddingWish,
    index: number,
    options: {
      className?: string;
      isFeatured?: boolean;
      style?: CSSProperties;
      tape?: boolean;
    } = {},
  ) {
    const base = getCardBaseStyle(wish, maxTilt);
    const zIndex = liftedZ[wish.id] ?? 10 + index;
    const isActive = activeId === wish.id;
    const hash = hashText(`${wish.id}-${wish.guestName}-${wish.wishText}`);
    const translateX = Math.round((randomUnit(hash + 41) - 0.5) * overlap);
    const translateY = Math.round((randomUnit(hash + 89) - 0.5) * overlap);

    return (
      <button
        key={wish.id}
        type="button"
        onClick={() => liftCard(wish.id)}
        onFocus={() => liftCard(wish.id)}
        className={cn(
          "relative rounded-xl text-left outline-none transition duration-200 ease-out",
          "hover:scale-105 focus-visible:scale-105 focus-visible:ring-2 focus-visible:ring-[#6c7411]/45 active:scale-105",
          isActive && "scale-105",
          options.className,
        )}
        style={{
          zIndex,
          ...options.style,
        }}
      >
        <span
          className={cn(
            "relative block overflow-y-auto rounded-xl border p-3 text-left shadow-md transition-all duration-200 sm:p-4",
            options.isFeatured ? "min-h-44" : "max-h-64 min-h-32",
            isActive
              ? "border-[#4f5609]/35 bg-white/85 shadow-2xl ring-2 ring-white/80"
              : "border-white/55 hover:shadow-xl",
          )}
          style={{
            backgroundColor: isActive
              ? "rgba(255, 255, 255, 0.9)"
              : base.backgroundColor,
            transform: options.isFeatured
              ? "none"
              : `translate(${translateX}px, ${translateY}px) rotate(${base.rotate}deg)`,
          }}
        >
          {options.tape ? (
            <span className="absolute left-1/2 top-0 h-5 w-16 -translate-x-1/2 -translate-y-1/2 rotate-[-3deg] rounded-sm bg-white/55 shadow-sm" />
          ) : null}
          <span
            className={cn(
              "block text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#5f6e53] sm:text-[0.68rem]",
              isActive && "text-[#4f5609]",
            )}
          >
            {wish.guestName}
          </span>
          <span
            className={cn(
              "font-script mt-2 block text-2xl leading-[0.98] text-[#4f5609] sm:text-3xl",
              options.isFeatured && "text-4xl sm:text-5xl",
              isActive &&
                "[text-shadow:0_1px_0_rgba(255,255,255,0.9),0_0_5px_rgba(255,255,255,0.9)]",
            )}
          >
            {wish.wishText}
          </span>
        </span>
      </button>
    );
  }

  function renderStructuredBoard() {
    const gapClass = getSpacingClass(density);
    const activeWish =
      wishes.find((wish) => wish.id === activeId) ?? wishes[wishes.length - 1];

    if (layout === "featured") {
      return (
        <div className="relative z-10 space-y-5">
          {activeWish ? (
            <div className="rounded-[1.5rem] border border-white/60 bg-white/42 p-3 shadow-inner backdrop-blur-sm">
              {renderNote(activeWish, wishes.indexOf(activeWish), {
                className: "mx-auto w-full max-w-lg",
                isFeatured: true,
              })}
            </div>
          ) : null}
          <div className={cn("columns-2 sm:columns-3", gapClass)}>
            {wishes.map((wish, index) => (
              <div key={wish.id} className={cn("break-inside-avoid", gapClass === "gap-2" ? "mb-2" : gapClass === "gap-5" ? "mb-5" : "mb-3")}>
                {renderNote(wish, index, { className: "w-full" })}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (layout === "staggered") {
      return (
        <div className={cn("relative z-10 grid grid-cols-2 sm:grid-cols-3", gapClass)}>
          {wishes.map((wish, index) =>
            renderNote(wish, index, {
              className: cn(
                "w-full",
                index % 2 === 1 && "mt-8",
                index % 3 === 2 && "sm:mt-12",
              ),
            }),
          )}
        </div>
      );
    }

    if (layout === "garland") {
      return (
        <div className={cn("relative z-10 grid grid-cols-2 pt-4 sm:grid-cols-3", gapClass)}>
          <div className="pointer-events-none absolute left-2 right-2 top-5 h-px bg-[#8a9a7a]/35" />
          {wishes.map((wish, index) =>
            renderNote(wish, index, {
              className: cn("w-full", index % 2 === 0 ? "mt-2" : "mt-8"),
              tape: true,
            }),
          )}
        </div>
      );
    }

    if (layout === "ribbon") {
      return (
        <div className="relative z-10 mx-auto flex max-w-xl flex-col gap-3 sm:gap-4">
          <div className="pointer-events-none absolute bottom-4 left-1/2 top-4 w-px -translate-x-1/2 bg-[#8a9a7a]/24" />
          {wishes.map((wish, index) =>
            renderNote(wish, index, {
              className: cn(
                "w-[82%] sm:w-[72%]",
                index % 2 === 0 ? "mr-auto" : "ml-auto",
              ),
            }),
          )}
        </div>
      );
    }

    return (
      <div className={cn("relative z-10 columns-2 sm:columns-3", gapClass)}>
        {wishes.map((wish, index) => (
          <div
            key={wish.id}
            className={cn(
              "break-inside-avoid",
              density === "airy" ? "mb-5" : density === "compact" ? "mb-2" : "mb-3",
            )}
          >
            {renderNote(wish, index, { className: "w-full" })}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#8a9a7a]/18 bg-white/72 p-5 text-left shadow-[0_18px_55px_rgba(52,49,45,0.07)] backdrop-blur-md sm:p-6"
      >
        <div className="flex items-center gap-3 text-[#8a9a7a]">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff9db] shadow-sm">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em]">
              Для молодых
            </p>
            <h3 className="font-display text-2xl leading-tight text-[#4f5609]">
              Оставьте пожелание
            </h3>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="wish-name" className="text-[#5f6e53]">
              Ваше имя
            </Label>
            <Input
              id="wish-name"
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
              maxLength={80}
              placeholder="Например, Егор и Ирина"
              className="border-[#8a9a7a]/25 bg-[#fbf3d9]/85 focus:border-[#8a9a7a] focus:ring-[#8a9a7a]/18"
            />
          </div>

          <div>
            <Label htmlFor="wish-text" className="text-[#5f6e53]">
              Ваше пожелание
            </Label>
            <Textarea
              id="wish-text"
              value={wishText}
              onChange={(event) => setWishText(event.target.value)}
              maxLength={600}
              placeholder="Напишите пару теплых слов..."
              className="min-h-36 border-[#8a9a7a]/25 bg-[#fbf3d9]/85 focus:border-[#8a9a7a] focus:ring-[#8a9a7a]/18"
            />
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-2xl bg-[#6c7411]/12 px-4 py-3 text-sm text-[#9b4f4f]">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 w-full rounded-2xl bg-[#6c7411] text-white shadow-[0_14px_30px_rgba(231,151,150,0.3)] hover:bg-[#d98281] focus-visible:outline-[#6c7411]"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Send className="mr-2 h-4 w-4" aria-hidden />
          )}
          Отправить пожелание
        </Button>
      </form>

      <div
        ref={boardRef}
        className="relative min-h-[34rem] overflow-hidden rounded-[1.75rem] border border-[#8a9a7a]/18 bg-[#f3ecdf] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.42),0_24px_70px_rgba(52,49,45,0.08)] sm:min-h-[40rem] sm:p-6"
        style={{
          minHeight: layout === "random" ? boardHeight : undefined,
          backgroundImage:
            "radial-gradient(circle at 18% 12%, rgba(244,208,63,0.16), transparent 24%), radial-gradient(circle at 82% 22%, rgba(231,151,150,0.14), transparent 28%), radial-gradient(circle at 28% 88%, rgba(138,154,122,0.13), transparent 30%), linear-gradient(135deg, rgba(255,255,255,0.48), rgba(253,251,247,0.18))",
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(90deg,rgba(138,154,122,0.45)_1px,transparent_1px),linear-gradient(rgba(138,154,122,0.35)_1px,transparent_1px)] [background-size:34px_34px]" />

        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center text-[#8a9a7a]">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
            Загружаем пожелания
          </div>
        ) : null}

        {!isLoading && wishes.length === 0 ? (
          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-3xl border border-dashed border-[#8a9a7a]/30 bg-white/50 p-6 text-center text-[#746f66]">
            Здесь появятся первые пожелания гостей.
          </div>
        ) : null}

        {layout === "random" ? (
          <div className="relative z-10">
            {wishes.map((wish, index) => {
              const style = cardStyles[index] ?? {
                ...getCardBaseStyle(wish, maxTilt),
                height: 150,
                width: 168,
                x: 20,
                y: 20 + index * 120,
              };

              return renderNote(wish, index, {
                className: "absolute",
                style: {
                  height: style.height,
                  left: style.x,
                  top: style.y,
                  width: style.width,
                },
              });
            })}
          </div>
        ) : (
          renderStructuredBoard()
        )}
      </div>
    </div>
  );
}

