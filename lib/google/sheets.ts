import "server-only";

import type { GuestInvite, GuestPerson } from "@/types/guest";
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

function formatGuestInternalPersonName(
  person: Pick<GuestPerson, "personName" | "adminLabel">,
): string {
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

interface RsvpNameCandidate {
  aliases: Set<string>;
  name: string;
}

export interface SyncRsvpGuestNamesResult {
  skipped: number;
  unchanged: number;
  updated: number;
}

function buildRsvpNameCandidates(
  invites: GuestInvite[],
): Map<string, RsvpNameCandidate[]> {
  const candidatesByInviteId = new Map<string, RsvpNameCandidate[]>();

  invites.forEach((invite) => {
    if (!invite.id) return;

    candidatesByInviteId.set(
      normalizeKey(invite.id),
      invite.people.map((person) => {
        const plainName = person.personName.trim();
        const name = formatGuestInternalPersonName(person) || plainName;
        const aliases = new Set(
          [plainName, name].filter(Boolean).map((alias) => normalizeKey(alias)),
        );

        return { aliases, name };
      }),
    );
  });

  return candidatesByInviteId;
}

function resolveSyncedRsvpName(
  currentName: string,
  candidates: RsvpNameCandidate[],
): string | null {
  const normalizedName = normalizeKey(currentName);
  const exactMatches = candidates.filter((candidate) =>
    candidate.aliases.has(normalizedName),
  );

  if (exactMatches.length === 1) {
    return exactMatches[0].name;
  }

  if (candidates.length === 1) {
    return candidates[0].name;
  }

  return null;
}

export async function syncRsvpGuestNamesFromInvites(
  invites: GuestInvite[],
): Promise<SyncRsvpGuestNamesResult> {
  const sheets = getSheetsClient();
  const sheetName = getRsvpSheetName();
  const candidatesByInviteId = buildRsvpNameCandidates(invites);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: getGoogleSpreadsheetId(),
    range: `${sheetName}!A:G`,
  });

  const rows = response.data.values ?? [];
  const updates: { range: string; values: string[][] }[] = [];
  let skipped = 0;
  let unchanged = 0;

  rows.slice(1).forEach((row, index) => {
    const inviteId = String(row[1] ?? "").trim();
    const currentName = String(row[2] ?? "").trim();
    if (!inviteId || !currentName) {
      skipped += 1;
      return;
    }

    const candidates = candidatesByInviteId.get(normalizeKey(inviteId));
    if (!candidates?.length) {
      skipped += 1;
      return;
    }

    const nextName = resolveSyncedRsvpName(currentName, candidates);
    if (!nextName) {
      skipped += 1;
      return;
    }

    if (nextName === currentName) {
      unchanged += 1;
      return;
    }

    updates.push({
      range: `${sheetName}!C${index + 2}`,
      values: [[nextName]],
    });
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

  return {
    skipped,
    unchanged,
    updated: updates.length,
  };
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
