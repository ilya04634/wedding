import "server-only";

import { Readable } from "node:stream";
import { getInviteBgFolderId } from "./auth";
import {
  getDriveClient,
  getServiceAccountDriveClient,
  shouldFallbackToServiceAccount,
} from "./drive-client";

export function buildDriveImageViewUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

export async function uploadPublicImage(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<string> {
  const folderId = getInviteBgFolderId();

  async function uploadWithDriveClient(
    drive: ReturnType<typeof getDriveClient>,
  ): Promise<string> {
    const created = await drive.files.create({
      supportsAllDrives: true,
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
      throw new Error("Google Drive did not return file id");
    }

    await drive.permissions.create({
      fileId,
      supportsAllDrives: true,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    return buildDriveImageViewUrl(fileId);
  }

  try {
    return await uploadWithDriveClient(getDriveClient());
  } catch (error) {
    if (!shouldFallbackToServiceAccount(error)) throw error;
    return uploadWithDriveClient(getServiceAccountDriveClient());
  }
}
