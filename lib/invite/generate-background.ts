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

function getInviteBackgroundPrompt(guestName: string) {
  let template = DEFAULT_PROMPT;

  try {
    const filePrompt = readFileSync(PROMPT_FILE_PATH, "utf8").trim();
    if (filePrompt) {
      template = filePrompt;
    }
  } catch (error) {
    console.warn("[generate-invite-bg] prompt file fallback", error);
  }

  if (template.includes("{{guestName}}")) {
    return template.replaceAll("{{guestName}}", guestName);
  }

  return `${template}. Subtle celebratory mood inspired by welcoming ${guestName}, keep it abstract only.`;
}

export async function generateImageWithOpenAI(
  apiKey: string,
  guestName: string,
): Promise<Buffer> {
  const model = getImageModel();
  const prompt = getInviteBackgroundPrompt(guestName);

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
): Promise<string> {
  const buffer = await generateImageWithOpenAI(openaiApiKey, guestName);
  const safeId = guestId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `invite-bg-${safeId}-${Date.now()}.png`;

  return uploadPublicImage(buffer, fileName, "image/png");
}
