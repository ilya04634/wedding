import "server-only";

import { getDriveClient } from "./drive-client";

export function extractDriveFileId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const filePathMatch = trimmed.match(/\/file\/d\/([^/]+)/);
  if (filePathMatch?.[1]) return filePathMatch[1];

  try {
    const parsed = new URL(trimmed);
    return parsed.searchParams.get("id");
  } catch {
    return null;
  }
}

export async function downloadDriveImage(fileId: string) {
  const drive = getDriveClient();
  const response = await drive.files.get(
    {
      fileId,
      alt: "media",
      supportsAllDrives: true,
    },
    {
      responseType: "arraybuffer",
    },
  );

  return {
    buffer: Buffer.from(response.data as ArrayBuffer),
    mimeType: String(response.headers["content-type"] || "image/png"),
  };
}

export async function downloadPublicDriveImage(fileId: string) {
  const url = new URL("https://drive.google.com/uc");
  url.searchParams.set("export", "download");
  url.searchParams.set("id", fileId);

  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`Public Drive download failed: ${response.status}`);
  }

  const mimeType = response.headers.get("content-type") || "image/png";
  if (!mimeType.startsWith("image/")) {
    throw new Error(`Public Drive download returned ${mimeType}`);
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    mimeType,
  };
}
