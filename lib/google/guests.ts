import "server-only";

import type { Guest } from "@/types/guest";
import {
  getGoogleSpreadsheetId,
  getGuestsSheetName,
} from "./auth";
import { getSheetsClient } from "./sheets-client";

const GUEST_COLUMNS = ["id", "name", "bg_url", "status"] as const;

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function rowToGuest(row: string[], columnIndex: Record<string, number>): Guest | null {
  const id = row[columnIndex.id]?.trim();
  const name = row[columnIndex.name]?.trim();
  if (!id || !name) return null;

  return {
    id,
    name,
    bgUrl: row[columnIndex.bg_url]?.trim() || null,
    status: row[columnIndex.status]?.trim() || null,
  };
}

async function fetchGuestRows(): Promise<Guest[]> {
  const sheets = getSheetsClient();
  const sheetName = getGuestsSheetName();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: getGoogleSpreadsheetId(),
    range: `${sheetName}!A:Z`,
  });

  const rows = response.data.values;
  if (!rows?.length) return [];

  const [headerRow, ...dataRows] = rows;
  const columnIndex: Record<string, number> = {};

  headerRow.forEach((cell, index) => {
    const key = normalizeHeader(String(cell));
    if ((GUEST_COLUMNS as readonly string[]).includes(key)) {
      columnIndex[key] = index;
    }
  });

  if (columnIndex.id === undefined || columnIndex.name === undefined) {
    columnIndex.id = 0;
    columnIndex.name = 1;
    columnIndex.bg_url = 2;
    columnIndex.status = 3;
  }

  return dataRows
    .map((row) => rowToGuest(row.map(String), columnIndex))
    .filter((g): g is Guest => g !== null);
}

export async function getGuestById(id: string): Promise<Guest | null> {
  const normalized = id.trim().toLowerCase();
  if (!normalized) return null;

  const guests = await fetchGuestRows();
  return guests.find((g) => g.id.toLowerCase() === normalized) ?? null;
}

export async function updateGuestBackground(
  id: string,
  bgUrl: string,
  status: string,
): Promise<void> {
  const sheets = getSheetsClient();
  const sheetName = getGuestsSheetName();
  const guests = await fetchGuestRows();
  const rowIndex = guests.findIndex((g) => g.id.toLowerCase() === id.toLowerCase());

  if (rowIndex === -1) {
    throw new Error(`Guest not found: ${id}`);
  }

  const sheetRow = rowIndex + 2;
  await sheets.spreadsheets.values.update({
    spreadsheetId: getGoogleSpreadsheetId(),
    range: `${sheetName}!C${sheetRow}:D${sheetRow}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[bgUrl, status]],
    },
  });
}
