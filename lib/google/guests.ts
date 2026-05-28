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
  "prompt",
  "invite_text",
  "name",
  "bg_url",
  "invite_url",
  "status",
] as const;

type GuestColumn = (typeof GUEST_COLUMNS)[number];
type ColumnIndex = Partial<Record<GuestColumn, number>>;

export interface GuestPersonUpdate {
  sheetRow: number;
  id: string;
  inviteName: string;
  personName: string;
  personType: GuestPersonType;
  childAge: string;
  prompt: string;
  inviteText: string;
  bgUrl: string;
  inviteUrl: string;
  status: string;
}

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

function transliterateForSlug(value: string) {
  const map: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "e",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
  };

  return value
    .toLowerCase()
    .split("")
    .map((char) => map[char] ?? char)
    .join("");
}

function slugifyInviteId(value: string) {
  const slug = transliterateForSlug(value)
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return slug || "invite";
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

  if (!personName) return null;

  return {
    id,
    inviteName: getCell(row, columnIndex, "invite_name") || null,
    personName,
    personType: normalizePersonType(getCell(row, columnIndex, "person_type")),
    childAge: getCell(row, columnIndex, "child_age") || null,
    prompt: getCell(row, columnIndex, "prompt") || null,
    inviteText: getCell(row, columnIndex, "invite_text") || null,
    bgUrl: getCell(row, columnIndex, "bg_url") || null,
    inviteUrl: getCell(row, columnIndex, "invite_url") || null,
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
  headerCount: number;
}> {
  const sheets = getSheetsClient();
  const sheetName = getGuestsSheetName();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: getGoogleSpreadsheetId(),
    range: `${sheetName}!A:Z`,
  });

  const rows = response.data.values;
  if (!rows?.length) return { people: [], columnIndex: {}, headerCount: 0 };

  const [headerRow, ...dataRows] = rows;
  const columnIndex = buildColumnIndex(headerRow);

  const people = dataRows
    .map((row, index) =>
      rowToGuestPerson(row.map(String), index + 2, columnIndex),
    )
    .filter((person): person is GuestPerson => person !== null);

  return { people, columnIndex, headerCount: headerRow.length };
}

function peopleToInvite(id: string, people: GuestPerson[]): GuestInvite | null {
  const invitePeople = people.filter(
    (person) => person.id && person.id.toLowerCase() === id,
  );
  if (!invitePeople.length) return null;

  return peopleGroupToInvite(invitePeople[0].id, invitePeople);
}

function peopleGroupToInvite(id: string, invitePeople: GuestPerson[]): GuestInvite {
  const explicitInviteName = invitePeople.find((person) => person.inviteName)
    ?.inviteName;
  const adultNames = invitePeople
    .filter((person) => person.personType !== "child")
    .map((person) => person.personName);
  const allNames = invitePeople.map((person) => person.personName);
  const inviteName =
    explicitInviteName || formatInviteName(adultNames.length ? adultNames : allNames);

  return {
    id,
    inviteName,
    people: invitePeople,
    prompt: invitePeople.find((person) => person.prompt)?.prompt ?? null,
    inviteText:
      invitePeople.find((person) => person.inviteText)?.inviteText ?? null,
    bgUrl: invitePeople.find((person) => person.bgUrl)?.bgUrl ?? null,
    inviteUrl: invitePeople.find((person) => person.inviteUrl)?.inviteUrl ?? null,
    status:
      invitePeople.find((person) => person.status === "done")?.status ??
      invitePeople.find((person) => person.status)?.status ??
      null,
  };
}

function groupPeopleByInvite(people: GuestPerson[]): GuestInvite[] {
  const groups = new Map<string, GuestPerson[]>();

  people.forEach((person) => {
    const groupKey = person.id
      ? `id:${person.id.toLowerCase()}`
      : `missing:${(person.inviteName || person.personName).toLowerCase()}`;
    groups.set(groupKey, [...(groups.get(groupKey) ?? []), person]);
  });

  return Array.from(groups.values()).map((group) =>
    peopleGroupToInvite(group.find((person) => person.id)?.id ?? "", group),
  );
}

function requireColumn(columnIndex: ColumnIndex, key: GuestColumn): number {
  const index = columnIndex[key];
  if (index === undefined) {
    throw new Error(`Guests sheet must contain ${key} column`);
  }

  return index;
}

async function ensureGuestColumn(
  sheetName: string,
  columnIndex: ColumnIndex,
  headerCount: number,
  key: GuestColumn,
): Promise<number> {
  const existingIndex = columnIndex[key];
  if (existingIndex !== undefined) return existingIndex;

  const nextIndex = headerCount;
  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.update({
    spreadsheetId: getGoogleSpreadsheetId(),
    range: `${sheetName}!${columnLetter(nextIndex)}1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[key]] },
  });

  columnIndex[key] = nextIndex;
  return nextIndex;
}

export async function getInviteById(id: string): Promise<GuestInvite | null> {
  const normalized = id.trim().toLowerCase();
  if (!normalized) return null;

  const { people } = await fetchGuestRows();
  return peopleToInvite(normalized, people);
}

export const getGuestById = getInviteById;

export async function listInvites(): Promise<GuestInvite[]> {
  const { people } = await fetchGuestRows();
  return groupPeopleByInvite(people);
}

export async function fillMissingGuestIds(): Promise<number> {
  const sheets = getSheetsClient();
  const sheetName = getGuestsSheetName();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: getGoogleSpreadsheetId(),
    range: `${sheetName}!A:Z`,
  });

  const rows = response.data.values;
  if (!rows?.length) return 0;

  const [headerRow, ...dataRows] = rows;
  const columnIndex = buildColumnIndex(headerRow);
  const idIndex = requireColumn(columnIndex, "id");
  const idColumn = columnLetter(idIndex);
  const usedIds = new Set<string>();
  const groupIds = new Map<string, string>();

  dataRows.forEach((row) => {
    const id = String(row[idIndex] ?? "").trim();
    if (id) usedIds.add(id.toLowerCase());
  });

  const updates = dataRows.flatMap((row, index) => {
    const values = row.map(String);
    const currentId = getCell(values, columnIndex, "id");
    if (currentId) return [];

    const inviteName = getCell(values, columnIndex, "invite_name");
    const personName =
      getCell(values, columnIndex, "person_name") ||
      getCell(values, columnIndex, "name");
    const groupKey = (inviteName || personName).trim().toLowerCase();
    if (!groupKey) return [];

    let nextId = groupIds.get(groupKey);
    if (!nextId) {
      const baseId = slugifyInviteId(inviteName || personName);
      nextId = baseId;
      let suffix = 2;

      while (usedIds.has(nextId.toLowerCase())) {
        nextId = `${baseId}-${suffix}`;
        suffix += 1;
      }

      usedIds.add(nextId.toLowerCase());
      groupIds.set(groupKey, nextId);
    }

    return [
      {
        range: `${sheetName}!${idColumn}${index + 2}`,
        values: [[nextId]],
      },
    ];
  });

  if (!updates.length) return 0;

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: getGoogleSpreadsheetId(),
    requestBody: {
      valueInputOption: "USER_ENTERED",
      data: updates,
    },
  });

  return updates.length;
}

export async function updateGuestPerson(update: GuestPersonUpdate): Promise<void> {
  const sheets = getSheetsClient();
  const sheetName = getGuestsSheetName();
  const { columnIndex, headerCount } = await fetchGuestRows();

  const fields: [GuestColumn, string][] = [
    ["id", update.id],
    ["invite_name", update.inviteName],
    ["person_name", update.personName],
    ["person_type", update.personType],
    ["child_age", update.childAge],
    ["prompt", update.prompt],
    ["invite_text", update.inviteText],
    ["bg_url", update.bgUrl],
    ["invite_url", update.inviteUrl],
    ["status", update.status],
  ];

  let nextHeaderCount = headerCount;
  for (const key of ["prompt", "invite_text", "invite_url"] as const) {
    const index = await ensureGuestColumn(
      sheetName,
      columnIndex,
      nextHeaderCount,
      key,
    );
    nextHeaderCount = Math.max(nextHeaderCount, index + 1);
  }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: getGoogleSpreadsheetId(),
    requestBody: {
      valueInputOption: "USER_ENTERED",
      data: fields.flatMap(([key, value]) => {
        const column = columnLetter(requireColumn(columnIndex, key));
        return {
          range: `${sheetName}!${column}${update.sheetRow}`,
          values: [[value]],
        };
      }),
    },
  });
}

export async function updateInviteText(id: string, inviteText: string): Promise<void> {
  const sheets = getSheetsClient();
  const sheetName = getGuestsSheetName();
  const { people, columnIndex, headerCount } = await fetchGuestRows();
  const matchingPeople = people.filter(
    (person) => person.id.toLowerCase() === id.toLowerCase(),
  );

  if (!matchingPeople.length) {
    throw new Error(`Invite not found: ${id}`);
  }

  const inviteTextIndex = await ensureGuestColumn(
    sheetName,
    columnIndex,
    headerCount,
    "invite_text",
  );
  const inviteTextColumn = columnLetter(inviteTextIndex);

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: getGoogleSpreadsheetId(),
    requestBody: {
      valueInputOption: "USER_ENTERED",
      data: matchingPeople.map((person) => ({
        range: `${sheetName}!${inviteTextColumn}${person.sheetRow}`,
        values: [[inviteText]],
      })),
    },
  });
}

export async function updateInviteBackground(
  id: string,
  bgUrl: string,
  status: string,
  inviteUrl?: string,
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
  const inviteUrlColumn =
    columnIndex.invite_url === undefined
      ? null
      : columnLetter(columnIndex.invite_url);

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
            ...(inviteUrlColumn && inviteUrl !== undefined
              ? [
                  {
                    range: `${sheetName}!${inviteUrlColumn}${person.sheetRow}`,
                    values: [[inviteUrl]],
                  },
                ]
              : []),
          ],
        },
      }),
    ),
  );
}

export const updateGuestBackground = updateInviteBackground;
