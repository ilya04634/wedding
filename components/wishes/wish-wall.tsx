"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { WeddingWish } from "@/types/wish";
import { Loader2, Send, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type WishCardStyle = {
  backgroundColor: string;
  left: string;
  top: number;
  rotate: number;
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

function getCardStyle(wish: WeddingWish, index: number): WishCardStyle {
  const hash = hashText(`${wish.id}-${wish.guestName}-${wish.wishText}`);
  const lane = index % 3;
  const leftByLane = [
    4 + (hash % 7),
    30 + ((hash >> 3) % 7),
    51 + ((hash >> 6) % 6),
  ];

  return {
    backgroundColor: NOTE_COLORS[hash % NOTE_COLORS.length],
    left: `${leftByLane[lane]}%`,
    top: 28 + Math.floor(index / 3) * 118 + ((hash >> 9) % 30),
    rotate: ((hash >> 12) % 13) - 6,
  };
}

export function WishWall() {
  const [wishes, setWishes] = useState<WeddingWish[]>([]);
  const [guestName, setGuestName] = useState("");
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

  const cardStyles = useMemo(
    () => wishes.map((wish, index) => getCardStyle(wish, index)),
    [wishes],
  );

  const boardHeight = Math.max(430, 190 + Math.ceil(wishes.length / 3) * 122);

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
      setGuestName("");
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
            <h3 className="font-display text-2xl leading-tight text-[#34312d]">
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
              className="border-[#8a9a7a]/25 bg-[#fdfbf7]/85 focus:border-[#8a9a7a] focus:ring-[#8a9a7a]/18"
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
              className="min-h-36 border-[#8a9a7a]/25 bg-[#fdfbf7]/85 focus:border-[#8a9a7a] focus:ring-[#8a9a7a]/18"
            />
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-2xl bg-[#e79796]/12 px-4 py-3 text-sm text-[#9b4f4f]">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 w-full rounded-2xl bg-[#e79796] text-white shadow-[0_14px_30px_rgba(231,151,150,0.3)] hover:bg-[#d98281] focus-visible:outline-[#e79796]"
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
        className="relative overflow-hidden rounded-[1.75rem] border border-[#8a9a7a]/18 bg-[#f3ecdf] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.42),0_24px_70px_rgba(52,49,45,0.08)]"
        style={{
          minHeight: boardHeight,
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

        {wishes.map((wish, index) => {
          const style = cardStyles[index];
          const zIndex = liftedZ[wish.id] ?? 10 + index;

          return (
            <button
              key={wish.id}
              type="button"
              onClick={() => liftCard(wish.id)}
              onFocus={() => liftCard(wish.id)}
              className={cn(
                "absolute w-[42vw] min-w-[8.5rem] max-w-[9.8rem] rounded-xl text-left outline-none transition duration-200 ease-out sm:w-52 sm:max-w-none",
                "hover:scale-105 focus-visible:scale-105 focus-visible:ring-2 focus-visible:ring-[#e79796]/45 active:scale-105",
                activeId === wish.id && "scale-105",
              )}
              style={{
                left: style.left,
                top: style.top,
                zIndex,
              }}
            >
              <span
                className={cn(
                  "block max-h-56 overflow-y-auto rounded-xl border border-white/55 p-3 shadow-md transition-shadow duration-200 sm:p-4",
                  activeId === wish.id ? "shadow-xl" : "hover:shadow-xl",
                )}
                style={{
                  backgroundColor: style.backgroundColor,
                  transform: `rotate(${style.rotate}deg)`,
                }}
              >
                <span className="block text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#5f6e53] sm:text-[0.68rem]">
                  {wish.guestName}
                </span>
                <span className="font-script mt-2 block text-2xl leading-[0.95] text-[#34312d] sm:text-3xl">
                  {wish.wishText}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
