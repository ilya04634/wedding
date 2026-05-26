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

const DRINK_LABELS: Record<RsvpPersonData["drink"], string> = {
  wine: "Вино",
  champagne: "Шампанское",
  strong: "Крепкое",
  no_alcohol: "Не буду алкоголь",
  not_applicable: "Не применимо",
};

function formatDrink(person: RsvpPersonData): string {
  if (person.personType === "child" || person.status === "declined") {
    return DRINK_LABELS.not_applicable;
  }

  return DRINK_LABELS[person.drink] ?? "";
}

function formatRows(data: RsvpFormData): string[][] {
  const timestamp = new Date().toISOString();

  return data.people.map((person) => [
    timestamp,
    data.guestId?.trim() || "",
    person.personName,
    PERSON_TYPE_LABELS[person.personType],
    STATUS_LABELS[person.status],
    formatDrink(person),
    person.allergens?.trim() || "",
  ]);
}

export async function appendRsvpRows(data: RsvpFormData): Promise<void> {
  const sheets = getSheetsClient();
  const sheetName = getRsvpSheetName();

  await sheets.spreadsheets.values.append({
    spreadsheetId: getGoogleSpreadsheetId(),
    range: `${sheetName}!A:G`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: formatRows(data),
    },
  });
}

export const appendRsvpRow = appendRsvpRows;
