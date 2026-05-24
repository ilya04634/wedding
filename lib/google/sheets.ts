import "server-only";

import {
  formatChildrenAgesColumn,
  formatChildrenForSheet,
  formatChildrenNamesColumn,
} from "@/lib/rsvp/format-children";
import type { RsvpFormData } from "@/types/rsvp";
import { getGoogleSpreadsheetId, getRsvpSheetName } from "./auth";
import { getSheetsClient } from "./sheets-client";

const STATUS_LABELS: Record<RsvpFormData["status"], string> = {
  confirmed: "Точно буду",
  maybe: "Пока не уверен(а)",
  declined: "Не смогу",
};

const DRINK_LABELS: Record<RsvpFormData["drinks"][number], string> = {
  wine: "Вино",
  strong: "Крепкое",
  non_alcoholic: "Безалкогольное",
};

function formatPlusOne(data: RsvpFormData): string {
  if (!data.withPartner) return "Нет";
  return data.partnerName?.trim() || "Да";
}

function formatWithChildren(data: RsvpFormData): string {
  if (!data.withChildren) return "Нет";
  return "Да";
}

/**
 * Timestamp | Guest_Id | Guest_Name | Will_Attend | Plus_One | With_Children |
 * Children_List | Children_Names | Children_Ages | Alcohol_Pref | Food_Allergies
 */
function formatRow(data: RsvpFormData): string[] {
  const children = data.withChildren ? data.children : [];

  return [
    new Date().toISOString(),
    data.guestId?.trim() || "",
    data.name,
    STATUS_LABELS[data.status],
    formatPlusOne(data),
    formatWithChildren(data),
    formatChildrenForSheet(children),
    formatChildrenNamesColumn(children),
    formatChildrenAgesColumn(children),
    data.drinks.length
      ? data.drinks.map((d) => DRINK_LABELS[d]).join(", ")
      : "—",
    data.allergies?.trim() || "",
  ];
}

export async function appendRsvpRow(data: RsvpFormData): Promise<void> {
  const sheets = getSheetsClient();
  const sheetName = getRsvpSheetName();

  await sheets.spreadsheets.values.append({
    spreadsheetId: getGoogleSpreadsheetId(),
    range: `${sheetName}!A:K`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [formatRow(data)],
    },
  });
}
