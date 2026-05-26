import "server-only";

import type { GuestInvite, GuestPerson, GuestPersonType } from "@/types/guest";
import { getGoogleSpreadsheetId, getGuestsSheetName } from "./auth";
import { getSheetsClient } from "./sheets-client";

const GUEST_COLUMNS = [
  "id",
  "invite_name",
  "person_name",
  "person_type",
  "child_age",
  "name",
  "bg_url",
  "status",
] as const;

type GuestColumn = (typeof GUEST_COLUMNS)[number];
type ColumnIndex = Partial<Record<GuestColumn, number>>;

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
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

function formatInviteName(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} и ${names[1]}`;

  return `${names.slice(0, -1).join(", ")} и ${names[names.length - 1]}`;
}

function normalizePersonType(value: string | undefined): GuestPersonType {
  return value?.trim().toLowerCase() === "child" ? "child" : "adult";
}

function getCell(row: string[], columnIndex: ColumnIndex, key: GuestColumn) {
  const index = columnIndex[key];
  return index === undefined ? "" : row[index]?.trim() ?? "";
}

function rowToGuestPerson(
  row: string[],
  sheetRow: number,
  columnIndex: ColumnIndex,
): GuestPerson | null {
  const id = getCell(row, columnIndex, "id");
  const personName =
    getCell(row, columnIndex, "person_name") || getCell(row, columnIndex, "name");

  if (!id || !personName) return null;

  return {
    id,
    inviteName: getCell(row, columnIndex, "invite_name") || null,
    personName,
    personType: normalizePersonType(getCell(row, columnIndex, "person_type")),
    childAge: getCell(row, columnIndex, "child_age") || null,
    bgUrl: getCell(row, columnIndex, "bg_url") || null,
    status: getCell(row, columnIndex, "status") || null,
    sheetRow,
  };
}

function buildColumnIndex(headerRow: unknown[]): ColumnIndex {
  const columnIndex: ColumnIndex = {};

  headerRow.forEach((cell, index) => {
    const key = normalizeHeader(String(cell));
    if ((GUEST_COLUMNS as readonly string[]).includes(key)) {
      columnIndex[key as GuestColumn] = index;
    }
  });

  if (columnIndex.id === undefined) {
    columnIndex.id = 0;
  }

  if (
    columnIndex.name === undefined &&
    columnIndex.person_name === undefined &&
    columnIndex.invite_name === undefined
  ) {
    columnIndex.name = 1;
  }

  if (columnIndex.bg_url === undefined) {
    columnIndex.bg_url = 2;
  }

  if (columnIndex.status === undefined) {
    columnIndex.status = 3;
  }

  return columnIndex;
}

async function fetchGuestRows(): Promise<{
  people: GuestPerson[];
  columnIndex: ColumnIndex;
}> {
  const sheets = getSheetsClient();
  const sheetName = getGuestsSheetName();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: getGoogleSpreadsheetId(),
    range: `${sheetName}!A:Z`,
  });

  const rows = response.data.values;
  if (!rows?.length) return { people: [], columnIndex: {} };

  const [headerRow, ...dataRows] = rows;
  const columnIndex = buildColumnIndex(headerRow);

  const people = dataRows
    .map((row, index) =>
      rowToGuestPerson(row.map(String), index + 2, columnIndex),
    )
    .filter((person): person is GuestPerson => person !== null);

  return { people, columnIndex };
}

function peopleToInvite(id: string, people: GuestPerson[]): GuestInvite | null {
  const invitePeople = people.filter((person) => person.id.toLowerCase() === id);
  if (!invitePeople.length) return null;

  const explicitInviteName = invitePeople.find((person) => person.inviteName)
    ?.inviteName;
  const adultNames = invitePeople
    .filter((person) => person.personType !== "child")
    .map((person) => person.personName);
  const allNames = invitePeople.map((person) => person.personName);
  const inviteName =
    explicitInviteName || formatInviteName(adultNames.length ? adultNames : allNames);

  return {
    id: invitePeople[0].id,
    inviteName,
    people: invitePeople,
    bgUrl: invitePeople.find((person) => person.bgUrl)?.bgUrl ?? null,
    status:
      invitePeople.find((person) => person.status === "done")?.status ??
      invitePeople.find((person) => person.status)?.status ??
      null,
  };
}

export async function getInviteById(id: string): Promise<GuestInvite | null> {
  const normalized = id.trim().toLowerCase();
  if (!normalized) return null;

  const { people } = await fetchGuestRows();
  return peopleToInvite(normalized, people);
}

export const getGuestById = getInviteById;

export async function updateInviteBackground(
  id: string,
  bgUrl: string,
  status: string,
): Promise<void> {
  const sheets = getSheetsClient();
  const sheetName = getGuestsSheetName();
  const { people, columnIndex } = await fetchGuestRows();
  const matchingPeople = people.filter(
    (person) => person.id.toLowerCase() === id.toLowerCase(),
  );

  if (!matchingPeople.length) {
    throw new Error(`Invite not found: ${id}`);
  }

  if (columnIndex.bg_url === undefined || columnIndex.status === undefined) {
    throw new Error("Guests sheet must contain bg_url and status columns");
  }

  const bgUrlColumn = columnLetter(columnIndex.bg_url);
  const statusColumn = columnLetter(columnIndex.status);

  await Promise.all(
    matchingPeople.map((person) =>
      sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: getGoogleSpreadsheetId(),
        requestBody: {
          valueInputOption: "USER_ENTERED",
          data: [
            {
              range: `${sheetName}!${bgUrlColumn}${person.sheetRow}`,
              values: [[bgUrl]],
            },
            {
              range: `${sheetName}!${statusColumn}${person.sheetRow}`,
              values: [[status]],
            },
          ],
        },
      }),
    ),
  );
}

export const updateGuestBackground = updateInviteBackground;
