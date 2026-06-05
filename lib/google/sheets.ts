import "server-only";

import type { RsvpFormData, RsvpPersonData } from "@/types/rsvp";
import { getGoogleSpreadsheetId, getRsvpSheetName } from "./auth";
import { getSheetsClient } from "./sheets-client";

const STATUS_LABELS: Record<RsvpPersonData["status"], string> = {
  confirmed: "Буду",
  maybe: "Пока не уверен(а)",
  declined: "Не буду",
};

const PERSON_TYPE_LABELS: Record<RsvpPersonData["personType"], string> = {
  adult: "Взрослый",
  child: "Ребенок",
};

const LEGACY_DRINK_LABELS: Record<string, string> = {
  wine: "Вино",
  champagne: "Шампанское",
  strong: "Крепкое",
  no_alcohol: "Не буду алкоголь",
  not_applicable: "Не применимо",
};

function formatDrink(person: RsvpPersonData): string {
  if (person.personType === "child" || person.status === "declined") {
    return LEGACY_DRINK_LABELS.not_applicable;
  }

  if (Array.isArray(person.drink)) {
    return person.drink
      .map((drink) => LEGACY_DRINK_LABELS[drink] ?? drink)
      .filter(Boolean)
      .join(", ");
  }

  return LEGACY_DRINK_LABELS[person.drink] ?? person.drink ?? "";
}

function formatInternalPersonName(person: RsvpPersonData): string {
  return [person.personName, person.adminLabel]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
}

function formatRows(data: RsvpFormData): string[][] {
  const timestamp = new Date().toISOString();

  return data.people.map((person) => [
    timestamp,
    data.guestId?.trim() || "",
    formatInternalPersonName(person),
    PERSON_TYPE_LABELS[person.personType],
    STATUS_LABELS[person.status],
    formatDrink(person),
    person.allergens?.trim() || "",
  ]);
}

function normalizeKey(value: string) {
  return value.trim().toLowerCase();
}

function buildRsvpKey(inviteId: string, personName: string) {
  return `${normalizeKey(inviteId)}::${normalizeKey(personName)}`;
}

function columnLetter(index: number): string {
  let dividend = index + 1;
  let column = "";

  while (dividend > 0) {
    const modulo = (dividend - 1) % 26;
    column = String.fromCharCode(65 + modulo) + column;
    dividend = Math.floor((dividend - modulo) / 26);
  }

  return column;
}

async function fetchExistingRsvpRows(): Promise<Map<string, number>> {
  const sheets = getSheetsClient();
  const sheetName = getRsvpSheetName();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: getGoogleSpreadsheetId(),
    range: `${sheetName}!A:G`,
  });

  const rows = response.data.values ?? [];
  const existing = new Map<string, number>();

  rows.slice(1).forEach((row, index) => {
    const inviteId = String(row[1] ?? "");
    const personName = String(row[2] ?? "");
    if (!inviteId || !personName) return;

    existing.set(buildRsvpKey(inviteId, personName), index + 2);
  });

  return existing;
}

export async function upsertRsvpRows(data: RsvpFormData): Promise<void> {
  const sheets = getSheetsClient();
  const sheetName = getRsvpSheetName();
  const rows = formatRows(data);
  const existingRows = await fetchExistingRsvpRows();
  const updates: { range: string; values: string[][] }[] = [];
  const inserts: string[][] = [];

  rows.forEach((row) => {
    const rowNumber = existingRows.get(buildRsvpKey(row[1], row[2]));
    if (rowNumber) {
      updates.push({
        range: `${sheetName}!A${rowNumber}:${columnLetter(row.length - 1)}${rowNumber}`,
        values: [row],
      });
      return;
    }

    inserts.push(row);
  });

  if (updates.length) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: getGoogleSpreadsheetId(),
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data: updates,
      },
    });
  }

  if (inserts.length) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: getGoogleSpreadsheetId(),
      range: `${sheetName}!A:G`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: inserts,
      },
    });
  }
}

export const appendRsvpRows = upsertRsvpRows;
export const appendRsvpRow = upsertRsvpRows;
