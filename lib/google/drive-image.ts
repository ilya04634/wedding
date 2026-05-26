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
