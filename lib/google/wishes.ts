import "server-only";

import type { WeddingWish } from "@/types/wish";
import { getGoogleSpreadsheetId } from "./auth";
import { getSheetsClient } from "./sheets-client";

const WISHES_SHEET_NAME =
  process.env.WISHES_SHEET_NAME?.trim() || "Пожелания";
const WISH_HEADERS = [
  "Timestamp",
  "Guest Name",
  "Wish Text",
  "Image URL",
  "Export Signature",
  "Exported At",
];

function quoteSheetName(name: string) {
  return `'${name.replace(/'/g, "''")}'`;
}

async function ensureWishesSheet(): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = getGoogleSpreadsheetId();
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });

  const exists = spreadsheet.data.sheets?.some(
    (sheet) => sheet.properties?.title === WISHES_SHEET_NAME,
  );

  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: WISHES_SHEET_NAME,
              },
            },
          },
        ],
      },
    });
  }

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${quoteSheetName(WISHES_SHEET_NAME)}!A1:F1`,
  });

  const headerRow = response.data.values?.[0] ?? [];
  if (!headerRow.length || headerRow.length < WISH_HEADERS.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${quoteSheetName(WISHES_SHEET_NAME)}!A1:F1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [WISH_HEADERS] },
    });
  }
}

export async function listWishes(): Promise<WeddingWish[]> {
  await ensureWishesSheet();

  const response = await getSheetsClient().spreadsheets.values.get({
    spreadsheetId: getGoogleSpreadsheetId(),
    range: `${quoteSheetName(WISHES_SHEET_NAME)}!A:F`,
  });

  const rows = response.data.values ?? [];

  return rows.slice(1).flatMap((row, index) => {
    const timestamp = String(row[0] ?? "").trim();
    const guestName = String(row[1] ?? "").trim();
    const wishText = String(row[2] ?? "").trim();
    const imageUrl = String(row[3] ?? "").trim();
    const signature = String(row[4] ?? "").trim();
    const exportedAt = String(row[5] ?? "").trim();

    if (!guestName || !wishText) return [];

    return {
      exportedAt: exportedAt || undefined,
      id: `${timestamp || "wish"}-${index + 2}`,
      imageUrl: imageUrl || undefined,
      sheetRow: index + 2,
      signature: signature || undefined,
      timestamp,
      guestName,
      wishText,
    };
  });
}

export async function appendWish({
  guestName,
  wishText,
}: {
  guestName: string;
  wishText: string;
}): Promise<WeddingWish> {
  await ensureWishesSheet();

  const timestamp = new Date().toISOString();

  await getSheetsClient().spreadsheets.values.append({
    spreadsheetId: getGoogleSpreadsheetId(),
    range: `${quoteSheetName(WISHES_SHEET_NAME)}!A:C`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[timestamp, guestName, wishText, "", "", ""]],
    },
  });

  return {
    id: `${timestamp}-${guestName}`,
    timestamp,
    guestName,
    wishText,
  };
}

export async function updateWishExportInfo({
  exportedAt,
  imageUrl,
  sheetRow,
  signature,
}: {
  exportedAt: string;
  imageUrl: string;
  sheetRow: number;
  signature: string;
}) {
  await ensureWishesSheet();

  await getSheetsClient().spreadsheets.values.update({
    spreadsheetId: getGoogleSpreadsheetId(),
    range: `${quoteSheetName(WISHES_SHEET_NAME)}!D${sheetRow}:F${sheetRow}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[imageUrl, signature, exportedAt]],
    },
  });
}
