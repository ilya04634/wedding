import "server-only";

import { uploadPublicImage } from "@/lib/google/drive";

const DEFAULT_PROMPT =
  "Abstract elegant wedding invitation background, soft cream ivory and muted gold palette, delicate floral bokeh and gentle light leaks, romantic atmosphere, vertical mobile composition, absolutely no text no letters no people no faces, high-end stationery style";

export async function generateImageWithOpenAI(
  apiKey: string,
  guestName: string,
): Promise<Buffer> {
  const prompt = `${DEFAULT_PROMPT}. Subtle celebratory mood inspired by welcoming ${guestName}, keep it abstract only.`;

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1792",
      quality: "standard",
      response_format: "url",
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI ${response.status}: ${errText}`);
  }

  const json = (await response.json()) as {
    data?: { url?: string }[];
  };
  const imageUrl = json.data?.[0]?.url;
  if (!imageUrl) {
    throw new Error("OpenAI не вернул URL изображения");
  }

  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok) {
    throw new Error(`Не удалось скачать изображение: ${imageRes.status}`);
  }

  const arrayBuffer = await imageRes.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * DALL-E 3 → скачивание → Google Drive (публичный URL).
 */
export async function generateAndUploadInviteBackground(
  guestId: string,
  guestName: string,
  openaiApiKey: string,
): Promise<string> {
  const buffer = await generateImageWithOpenAI(openaiApiKey, guestName);
  const safeId = guestId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `invite-bg-${safeId}-${Date.now()}.png`;

  return uploadPublicImage(buffer, fileName, "image/png");
}
