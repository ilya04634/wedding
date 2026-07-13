import "server-only";

import { createHash } from "node:crypto";
import { getGoogleDriveFolderId } from "@/lib/google/auth";
import { ensureDriveFolder, uploadPublicImageToFolder } from "@/lib/google/drive";
import { buildWishCardFileName, renderWishCardPng } from "@/lib/wishes/wish-card-image";
import type { WeddingWish } from "@/types/wish";
import { listWishes, updateWishExportInfo } from "./wishes";

const WISH_CARDS_FOLDER_NAME =
  process.env.WISH_CARDS_FOLDER_NAME?.trim() || "WishCards";

export interface WishCardExportResult {
  exportedAt: string;
  exports: Array<{
    imageUrl: string;
    wish: WeddingWish;
  }>;
  skipped: number;
  total: number;
}

function buildWishSignature(wish: WeddingWish) {
  return createHash("sha256")
    .update(JSON.stringify([wish.id, wish.guestName, wish.wishText]))
    .digest("hex");
}

async function getWishCardsFolderId() {
  const explicitFolderId = process.env.WISH_CARDS_FOLDER_ID?.trim();
  if (explicitFolderId) return explicitFolderId;

  return ensureDriveFolder(getGoogleDriveFolderId(), WISH_CARDS_FOLDER_NAME);
}

export async function exportWishCardsToDrive(): Promise<WishCardExportResult> {
  const wishes = await listWishes();
  const folderId = await getWishCardsFolderId();
  const exportedAt = new Date().toISOString();
  const exports: WishCardExportResult["exports"] = [];
  let skipped = 0;

  for (let index = 0; index < wishes.length; index += 1) {
    const wish = wishes[index];
    const signature = buildWishSignature(wish);
    if (wish.imageUrl && wish.signature === signature) {
      skipped += 1;
      continue;
    }

    if (!wish.sheetRow) {
      skipped += 1;
      continue;
    }

    const png = await renderWishCardPng(wish);
    const imageUrl = await uploadPublicImageToFolder(
      png,
      buildWishCardFileName(wish, index),
      "image/png",
      folderId,
    );

    exports.push({ imageUrl, wish });
    await updateWishExportInfo({
      exportedAt,
      imageUrl,
      sheetRow: wish.sheetRow,
      signature,
    });
  }

  return {
    exportedAt,
    exports,
    skipped,
    total: exports.length,
  };
}
