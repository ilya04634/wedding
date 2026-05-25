import "server-only";

import { uploadPublicImage } from "@/lib/google/drive";

const DEFAULT_PROMPT =
  "Abstract elegant wedding invitation background, soft cream ivory and muted gold palette, delicate floral bokeh and gentle light leaks, romantic atmosphere, vertical mobile composition, absolutely no text no letters no people no faces, high-end stationery style";

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

function buildImageRequestBody(model: string, prompt: string) {
  if (isGptImageModel(model)) {
    return {
      model,
      prompt,
      n: 1,
      size: "1024x1536",
      quality: "medium",
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

export async function generateImageWithOpenAI(
  apiKey: string,
  guestName: string,
): Promise<Buffer> {
  const model = getImageModel();
  const prompt = `${DEFAULT_PROMPT}. Subtle celebratory mood inspired by welcoming ${guestName}, keep it abstract only.`;

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
    return Buffer.from(image.b64_json, "base64");
  }

  if (!image?.url) {
    throw new Error("OpenAI did not return image data");
  }

  const imageRes = await fetch(image.url);
  if (!imageRes.ok) {
    throw new Error(`Failed to download OpenAI image: ${imageRes.status}`);
  }

  const arrayBuffer = await imageRes.arrayBuffer();
  return Buffer.from(arrayBuffer);
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
