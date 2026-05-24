import "server-only";

import { Readable } from "node:stream";
import { getInviteBgFolderId } from "./auth";
import { getDriveClient } from "./drive-client";

/** Публичная ссылка для просмотра изображения в браузере */
export function buildDriveImageViewUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

/**
 * Загружает изображение в Google Drive, делает доступным «всем по ссылке»,
 * возвращает постоянный URL для bg_url.
 */
export async function uploadPublicImage(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<string> {
  const drive = getDriveClient();
  const folderId = getInviteBgFolderId();

  const created = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: "id",
  });

  const fileId = created.data.id;
  if (!fileId) {
    throw new Error("Google Drive не вернул id файла");
  }

  await drive.permissions.create({
    fileId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  return buildDriveImageViewUrl(fileId);
}
