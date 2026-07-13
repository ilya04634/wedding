import "server-only";

import { createHash } from "node:crypto";
import { getGoogleDriveFolderId, getGoogleSpreadsheetId } from "@/lib/google/auth";
import { ensureDriveFolder, uploadPublicImageToFolder } from "@/lib/google/drive";
import { buildWishCardFileName, renderWishCardPng } from "@/lib/wishes/wish-card-image";
import type { WeddingWish } from "@/types/wish";
import { listWishes } from "./wishes";
import { getSheetsClient } from "./sheets-client";

const WISH_EXPORTS_SHEET_NAME =
  process.env.WISH_EXPORTS_SHEET_NAME?.trim() || "WishExports";
const WISH_EXPORT_HEADERS = [
  "Exported At",
  "Wish Id",
  "Guest Name",
  "Wish Text",
  "Image URL",
  "Signature",
];

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

function quoteSheetName(name: string) {
  return `'${name.replace(/'/g, "''")}'`;
}

async function ensureWishExportsSheet() {
  const sheets = getSheetsClient();
  const spreadsheetId = getGoogleSpreadsheetId();
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });

  const exists = spreadsheet.data.sheets?.some(
    (sheet) => sheet.properties?.title === WISH_EXPORTS_SHEET_NAME,
  );

  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: WISH_EXPORTS_SHEET_NAME,
              },
            },
          },
        ],
      },
    });
  }

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${quoteSheetName(WISH_EXPORTS_SHEET_NAME)}!A1:F1`,
  });

  const headerRow = response.data.values?.[0] ?? [];
  if (!headerRow.length || headerRow.length < WISH_EXPORT_HEADERS.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${quoteSheetName(WISH_EXPORTS_SHEET_NAME)}!A1:F1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [WISH_EXPORT_HEADERS] },
    });
  }
}

function buildWishSignature(wish: WeddingWish) {
  return createHash("sha256")
    .update(JSON.stringify([wish.id, wish.guestName, wish.wishText]))
    .digest("hex");
}

async function fetchExportedWishSignatures() {
  await ensureWishExportsSheet();

  const response = await getSheetsClient().spreadsheets.values.get({
    spreadsheetId: getGoogleSpreadsheetId(),
    range: `${quoteSheetName(WISH_EXPORTS_SHEET_NAME)}!B:F`,
  });

  const rows = response.data.values ?? [];
  const signatures = new Set<string>();

  rows.slice(1).forEach((row) => {
    const wishId = String(row[0] ?? "").trim();
    const signature = String(row[4] ?? "").trim();
    if (signature) {
      signatures.add(signature);
      return;
    }

    if (wishId) signatures.add(`legacy:${wishId}`);
  });

  return signatures;
}

async function getWishCardsFolderId() {
  const explicitFolderId = process.env.WISH_CARDS_FOLDER_ID?.trim();
  if (explicitFolderId) return explicitFolderId;

  return ensureDriveFolder(getGoogleDriveFolderId(), WISH_CARDS_FOLDER_NAME);
}

async function appendWishExportRows(
  exportedAt: string,
  exports: WishCardExportResult["exports"],
) {
  if (!exports.length) return;

  await ensureWishExportsSheet();

  await getSheetsClient().spreadsheets.values.append({
    spreadsheetId: getGoogleSpreadsheetId(),
    range: `${quoteSheetName(WISH_EXPORTS_SHEET_NAME)}!A:F`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: exports.map(({ imageUrl, wish }) => [
        exportedAt,
        wish.id,
        wish.guestName,
        wish.wishText,
        imageUrl,
        buildWishSignature(wish),
      ]),
    },
  });
}

export async function exportWishCardsToDrive(): Promise<WishCardExportResult> {
  const wishes = await listWishes();
  const exportedSignatures = await fetchExportedWishSignatures();
  const folderId = await getWishCardsFolderId();
  const exportedAt = new Date().toISOString();
  const exports: WishCardExportResult["exports"] = [];
  let skipped = 0;

  for (let index = 0; index < wishes.length; index += 1) {
    const wish = wishes[index];
    const signature = buildWishSignature(wish);
    if (
      exportedSignatures.has(signature) ||
      exportedSignatures.has(`legacy:${wish.id}`)
    ) {
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
  }

  await appendWishExportRows(exportedAt, exports);

  return {
    exportedAt,
    exports,
    skipped,
    total: exports.length,
  };
}
