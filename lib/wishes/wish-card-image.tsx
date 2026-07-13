import "server-only";

import type { WeddingWish } from "@/types/wish";
import { ImageResponse } from "next/og";

const CARD_COLORS = ["#f7d6d1", "#dfe7d5", "#fff1a9", "#fff6dd"];
const CARD_WIDTH = 900;
const HORIZONTAL_PADDING = 72;
const VERTICAL_PADDING = 68;

function hashText(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function splitLongWord(word: string, maxChars: number) {
  const chunks: string[] = [];

  for (let index = 0; index < word.length; index += maxChars) {
    chunks.push(word.slice(index, index + maxChars));
  }

  return chunks;
}

function wrapText(value: string, maxChars: number) {
  return value
    .split(/\r?\n/)
    .flatMap((paragraph) => {
      const words = paragraph.trim().split(/\s+/).filter(Boolean);
      const lines: string[] = [];
      let currentLine = "";

      words.forEach((rawWord) => {
        const wordParts =
          rawWord.length > maxChars ? splitLongWord(rawWord, maxChars) : [rawWord];

        wordParts.forEach((word) => {
          const nextLine = currentLine ? `${currentLine} ${word}` : word;
          if (nextLine.length <= maxChars) {
            currentLine = nextLine;
            return;
          }

          if (currentLine) lines.push(currentLine);
          currentLine = word;
        });
      });

      if (currentLine) lines.push(currentLine);
      return lines.length ? lines : [""];
    });
}

function getTextSize(text: string) {
  if (text.length > 460) return 46;
  if (text.length > 300) return 52;
  if (text.length > 180) return 58;
  return 66;
}

function getCardMetrics(wishText: string) {
  const textSize = getTextSize(wishText);
  const maxChars = Math.max(16, Math.floor(560 / (textSize * 0.52)));
  const lines = wrapText(wishText, maxChars);
  const lineHeight = Math.round(textSize * 1.04);
  const contentHeight = lines.length * lineHeight;
  const cardHeight = clamp(360 + contentHeight, 640, 2200);

  return { cardHeight, lineHeight, lines, textSize };
}

function sanitizeFilePart(value: string) {
  return (
    value
      .replace(/[\\/:*?"<>|]/g, "_")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 44) || "guest"
  );
}

export function buildWishCardFileName(wish: WeddingWish, index: number) {
  const datePart = new Date().toISOString().slice(0, 10);
  const guestPart = sanitizeFilePart(wish.guestName);
  return `wish-card-${datePart}-${String(index + 1).padStart(2, "0")}-${guestPart}.png`;
}

export async function renderWishCardPng(wish: WeddingWish): Promise<Buffer> {
  const hash = hashText(`${wish.id}-${wish.guestName}-${wish.wishText}`);
  const color = CARD_COLORS[hash % CARD_COLORS.length];
  const { cardHeight, lineHeight, lines, textSize } = getCardMetrics(wish.wishText);

  const response = new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at 18% 12%, rgba(244,208,63,0.18), transparent 28%), radial-gradient(circle at 82% 20%, rgba(231,151,150,0.14), transparent 30%), linear-gradient(135deg, #f3ecdf 0%, #fbf3d9 100%)",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: 40,
          width: "100%",
        }}
      >
        <div
          style={{
            background: color,
            border: "3px solid rgba(255,255,255,0.72)",
            borderRadius: 34,
            boxShadow: "0 28px 70px rgba(52,49,45,0.16)",
            display: "flex",
            flexDirection: "column",
            minHeight: cardHeight - 80,
            padding: `${VERTICAL_PADDING}px ${HORIZONTAL_PADDING}px`,
            position: "relative",
            width: CARD_WIDTH - 80,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.56)",
              borderRadius: 8,
              height: 42,
              left: "50%",
              position: "absolute",
              top: -22,
              transform: "translateX(-50%) rotate(-3deg)",
              width: 180,
            }}
          />
          <div
            style={{
              color: "#5f6e53",
              display: "flex",
              fontFamily: "sans-serif",
              fontSize: 27,
              fontWeight: 800,
              letterSpacing: 6,
              lineHeight: 1.1,
              marginBottom: 38,
              textTransform: "uppercase",
            }}
          >
            {wish.guestName}
          </div>
          <div
            style={{
              color: "#4f5609",
              display: "flex",
              flexDirection: "column",
              fontFamily: "cursive",
              fontSize: textSize,
              lineHeight: `${lineHeight}px`,
              overflowWrap: "anywhere",
              textShadow:
                "0 1px 0 rgba(255,255,255,0.9), 0 0 7px rgba(255,255,255,0.72)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {lines.map((line, index) => (
              <div key={`${line}-${index}`} style={{ display: "flex" }}>
                {line}
              </div>
            ))}
          </div>
          <div
            style={{
              alignItems: "center",
              color: "rgba(95,110,83,0.72)",
              display: "flex",
              fontFamily: "serif",
              fontSize: 24,
              justifyContent: "space-between",
              marginTop: "auto",
              paddingTop: 46,
            }}
          >
            <span>Илья и Дарья</span>
            <span>с любовью</span>
          </div>
        </div>
      </div>
    ),
    {
      height: cardHeight,
      width: CARD_WIDTH,
    },
  );

  return Buffer.from(await response.arrayBuffer());
}
