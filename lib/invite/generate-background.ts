import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { uploadPublicImage } from "@/lib/google/drive";

const DEFAULT_PROMPT =
  "Abstract elegant wedding invitation background, soft cream ivory and muted gold palette, delicate floral bokeh and gentle light leaks, romantic atmosphere, vertical mobile composition, absolutely no text no letters no people no faces, high-end stationery style";

const PROMPT_FILE_PATH = join(process.cwd(), "prompts", "invite-background.txt");

type OpenAIImage = {
  b64_json?: string;
  url?: string;
};

type OpenAIImagesResponse = {
  data?: OpenAIImage[];
};

type InviteVisualVariant = {
  flower: string;
  palette: string;
  composition: string;
  light: string;
  texture: string;
  seed: number;
};

const FLOWER_VARIANTS = [
  "garden roses with peony-like soft petals",
  "lavender sprigs and tiny meadow flowers",
  "white daisies with small yellow centers",
  "airy baby's breath and delicate jasmine",
  "soft ranunculus blossoms and sage leaves",
  "wild chamomile flowers and pale greenery",
  "sweet pea vines with subtle blush petals",
  "minimal magnolia petals with botanical line accents",
];

const PALETTE_VARIANTS = [
  "peony pink, warm ivory, muted sage green",
  "sage green, cream, pale lavender accents",
  "lemon sorbet yellow, warm white, fresh green",
  "soft blush, champagne gold, eucalyptus green",
  "pale peach, ivory, dusty olive",
  "buttery yellow, linen cream, gentle rose",
  "powder pink, pearl white, herbal green",
  "light apricot, cream, soft pistachio",
];

const COMPOSITION_VARIANTS = [
  "florals gathered in the upper-left and lower-right corners",
  "a loose botanical wreath around the edges with a calm center",
  "asymmetric flowers along the bottom edge with floating petals above",
  "a soft vertical garland on the left side with open space in the center",
  "corner bouquets with a thin one-line-art floral contour",
  "delicate flowers framing the top and bottom like stationery borders",
];

const LIGHT_VARIANTS = [
  "morning garden light",
  "warm golden-hour glow",
  "soft diffused summer daylight",
  "gentle backlit bokeh",
  "airy overcast garden light",
];

const TEXTURE_VARIANTS = [
  "subtle watercolor wash",
  "fine handmade paper grain",
  "soft silk-like fabric texture",
  "barely visible watercolor bloom",
  "delicate stationery paper texture",
];

function getImageModel() {
  return process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-1";
}

function isGptImageModel(model: string) {
  return model.startsWith("gpt-image-");
}

function supportsBackgroundParameter(model: string) {
  return model === "gpt-image-1" || model === "gpt-image-1.5";
}

function buildImageRequestBody(model: string, prompt: string) {
  if (isGptImageModel(model)) {
    return {
      model,
      prompt,
      n: 1,
      size: "1024x1536",
      quality: "medium",
      ...(supportsBackgroundParameter(model) ? { background: "opaque" } : {}),
      output_format: "png",
    };
  }

  return {
    model,
    prompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
    response_format: "url",
  };
}

function hashStringToNumber(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function pickVariant<T>(items: T[], seed: number, salt: number) {
  return items[(seed + salt * 2654435761) % items.length];
}

function getInviteVisualVariant(guestId: string): InviteVisualVariant {
  const seed = hashStringToNumber(guestId || "default-invite");

  return {
    flower: pickVariant(FLOWER_VARIANTS, seed, 1),
    palette: pickVariant(PALETTE_VARIANTS, seed, 2),
    composition: pickVariant(COMPOSITION_VARIANTS, seed, 3),
    light: pickVariant(LIGHT_VARIANTS, seed, 4),
    texture: pickVariant(TEXTURE_VARIANTS, seed, 5),
    seed,
  };
}

function getInviteBackgroundPrompt(
  guestId: string,
  guestName: string,
  customPrompt?: string | null,
) {
  let template = DEFAULT_PROMPT;

  try {
    const filePrompt = readFileSync(PROMPT_FILE_PATH, "utf8").trim();
    if (filePrompt) {
      template = filePrompt;
    }
  } catch (error) {
    console.warn("[generate-invite-bg] prompt file fallback", error);
  }

  const basePrompt = template.includes("{{guestName}}")
    ? template.replaceAll("{{guestName}}", guestName)
    : `${template}. Subtle celebratory mood inspired by welcoming ${guestName}, keep it abstract only.`;

  const variant = getInviteVisualVariant(guestId);
  const variantPrompt = `${basePrompt}

Deterministic guest-specific visual variant based on invite id. Keep the overall style consistent with the main prompt, but use this variant to make this invite distinct:
- Floral motif: ${variant.flower}.
- Accent palette: ${variant.palette}.
- Composition: ${variant.composition}.
- Lighting: ${variant.light}.
- Surface texture: ${variant.texture}.
- Internal visual seed reference: ${variant.seed}. Do not render this number or any text.`;

  const promptAddon = customPrompt?.trim();
  if (!promptAddon) return variantPrompt;

  return `${variantPrompt}

Additional guest-specific preferences. Treat these as accents only and keep the same overall wedding style: ${promptAddon}`;
}

export async function generateImageWithOpenAI(
  apiKey: string,
  guestId: string,
  guestName: string,
  customPrompt?: string | null,
): Promise<Buffer> {
  const model = getImageModel();
  const prompt = getInviteBackgroundPrompt(guestId, guestName, customPrompt);

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildImageRequestBody(model, prompt)),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `OpenAI image generation failed (${response.status}, ${model}): ${errText}`,
    );
  }

  const json = (await response.json()) as OpenAIImagesResponse;
  const image = json.data?.[0];

  if (image?.b64_json) {
    const buffer = Buffer.from(image.b64_json, "base64");
    if (buffer.length < 1024) {
      throw new Error("OpenAI returned an unexpectedly small image");
    }
    return buffer;
  }

  if (!image?.url) {
    throw new Error("OpenAI did not return image data");
  }

  const imageRes = await fetch(image.url);
  if (!imageRes.ok) {
    throw new Error(`Failed to download OpenAI image: ${imageRes.status}`);
  }

  const arrayBuffer = await imageRes.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (buffer.length < 1024) {
    throw new Error("OpenAI returned an unexpectedly small image");
  }
  return buffer;
}

export async function generateAndUploadInviteBackground(
  guestId: string,
  guestName: string,
  openaiApiKey: string,
  customPrompt?: string | null,
): Promise<string> {
  const buffer = await generateImageWithOpenAI(
    openaiApiKey,
    guestId,
    guestName,
    customPrompt,
  );
  const safeId = guestId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `invite-bg-${safeId}-${Date.now()}.png`;

  return uploadPublicImage(buffer, fileName, "image/png");
}
