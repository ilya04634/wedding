import "server-only";

import type { GuestInvite, GuestPerson, GuestPersonType } from "@/types/guest";
import { getGoogleSpreadsheetId, getGuestsSheetName } from "./auth";
import { getSheetsClient } from "./sheets-client";

const GUEST_COLUMNS = [
  "id",
  "invite_name",
  "person_name",
  "admin_label",
  "invite_text",
  "person_type",
  "child_age",
  "prompt",
  "no_declension",
  "informal_tone",
  "name",
  "bg_url",
  "invite_url",
  "status",
] as const;

const INVITE_META_SHEET_NAME = "InviteMeta";
const INVITE_META_COLUMNS = ["id", "bg_url", "status", "updated_at"] as const;

type GuestColumn = (typeof GUEST_COLUMNS)[number];
type ColumnIndex = Partial<Record<GuestColumn, number>>;
type InviteMetaColumn = (typeof INVITE_META_COLUMNS)[number];
type InviteMetaColumnIndex = Partial<Record<InviteMetaColumn, number>>;

interface InviteMeta {
  bgUrl: string | null;
  status: string | null;
  updatedAt: string | null;
}

export interface GuestPersonUpdate {
  sheetRow: number;
  id: string;
  inviteName: string;
  personName: string;
  adminLabel: string;
  personType: GuestPersonType;
  childAge: string;
  prompt: string;
  inviteText: string;
  noDeclension: boolean;
  informalTone: boolean;
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

function parseBooleanCell(value: string | undefined): boolean {
  const normalized = value?.trim().toLowerCase() ?? "";
  return ["1", "true", "yes", "y", "да", "д", "истина"].includes(normalized);
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

function buildInviteGroupKey(inviteName: string) {
  const normalized = inviteName.trim().toLowerCase();
  return normalized ? `invite:${normalized}` : "";
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
    adminLabel: getCell(row, columnIndex, "admin_label") || null,
    personType: normalizePersonType(getCell(row, columnIndex, "person_type")),
    childAge: getCell(row, columnIndex, "child_age") || null,
    prompt: getCell(row, columnIndex, "prompt") || null,
    inviteText: getCell(row, columnIndex, "invite_text") || null,
    noDeclension: parseBooleanCell(getCell(row, columnIndex, "no_declension")),
    informalTone: parseBooleanCell(getCell(row, columnIndex, "informal_tone")),
    bgUrl: getCell(row, columnIndex, "bg_url") || null,
    inviteUrl: getCell(row, columnIndex, "invite_url") || null,
    status: getCell(row, columnIndex, "status") || null,
    statusUpdatedAt: null,
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

  return columnIndex;
}

function buildInviteMetaColumnIndex(headerRow: unknown[]): InviteMetaColumnIndex {
  const columnIndex: InviteMetaColumnIndex = {};

  headerRow.forEach((cell, index) => {
    const key = normalizeHeader(String(cell));
    if ((INVITE_META_COLUMNS as readonly string[]).includes(key)) {
      columnIndex[key as InviteMetaColumn] = index;
    }
  });

  return columnIndex;
}

function getMetaCell(
  row: string[],
  columnIndex: InviteMetaColumnIndex,
  key: InviteMetaColumn,
) {
  const index = columnIndex[key];
  return index === undefined ? "" : row[index]?.trim() ?? "";
}

async function ensureInviteMetaSheet(): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = getGoogleSpreadsheetId();

  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const exists = spreadsheet.data.sheets?.some(
    (sheet) => sheet.properties?.title === INVITE_META_SHEET_NAME,
  );

  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: INVITE_META_SHEET_NAME,
              },
            },
          },
        ],
      },
    });
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${INVITE_META_SHEET_NAME}!A1:D1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [Array.from(INVITE_META_COLUMNS)] },
  });
}

async function fetchInviteMetaMap(): Promise<Map<string, InviteMeta>> {
  const sheets = getSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: getGoogleSpreadsheetId(),
      range: `${INVITE_META_SHEET_NAME}!A:D`,
    });

    const rows = response.data.values;
    if (!rows?.length) return new Map();

    const [headerRow, ...dataRows] = rows;
    const columnIndex = buildInviteMetaColumnIndex(headerRow);
    const map = new Map<string, InviteMeta>();

    dataRows.forEach((row) => {
      const values = row.map(String);
      const id = getMetaCell(values, columnIndex, "id");
      if (!id) return;

      map.set(id.toLowerCase(), {
        bgUrl: getMetaCell(values, columnIndex, "bg_url") || null,
        status: getMetaCell(values, columnIndex, "status") || null,
        updatedAt: getMetaCell(values, columnIndex, "updated_at") || null,
      });
    });

    return map;
  } catch {
    return new Map();
  }
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

  const inviteMeta = await fetchInviteMetaMap();
  const peopleWithMeta = people.map((person) => {
    const meta = person.id ? inviteMeta.get(person.id.toLowerCase()) : null;
    if (!meta) return person;

    return {
      ...person,
      bgUrl: meta.bgUrl ?? person.bgUrl,
      status: meta.status ?? person.status,
      statusUpdatedAt: meta.updatedAt,
    };
  });

  return { people: peopleWithMeta, columnIndex, headerCount: headerRow.length };
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
    noDeclension: invitePeople.every((person) => person.noDeclension),
    informalTone: invitePeople.some((person) => person.informalTone),
    bgUrl: invitePeople.find((person) => person.bgUrl)?.bgUrl ?? null,
    inviteUrl: invitePeople.find((person) => person.inviteUrl)?.inviteUrl ?? null,
    status:
      invitePeople.find((person) => person.status === "done")?.status ??
      invitePeople.find((person) => person.status)?.status ??
      null,
    statusUpdatedAt:
      invitePeople.find((person) => person.statusUpdatedAt)?.statusUpdatedAt ??
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
  const existingIdsByInviteGroup = new Map<string, string>();
  const existingPersonNamesByInviteGroup = new Map<string, Set<string>>();

  dataRows.forEach((row) => {
    const values = row.map(String);
    const id = String(row[idIndex] ?? "").trim();
    if (!id) return;

    usedIds.add(id.toLowerCase());

    const inviteName = getCell(values, columnIndex, "invite_name");
    const groupKey = buildInviteGroupKey(inviteName);
    if (groupKey && !existingIdsByInviteGroup.has(groupKey)) {
      existingIdsByInviteGroup.set(groupKey, id);
    }
    if (groupKey) {
      const personName = (
        getCell(values, columnIndex, "person_name") ||
        getCell(values, columnIndex, "name")
      )
        .trim()
        .toLowerCase();
      const names = existingPersonNamesByInviteGroup.get(groupKey) ?? new Set();
      if (personName) names.add(personName);
      existingPersonNamesByInviteGroup.set(groupKey, names);
    }
  });

  let previousGeneratedInviteGroupKey = "";
  let previousGeneratedId = "";
  let previousGeneratedPersonName = "";

  const updates = dataRows.flatMap((row, index) => {
    const values = row.map(String);
    const currentId = getCell(values, columnIndex, "id");
    if (currentId) {
      previousGeneratedInviteGroupKey = "";
      previousGeneratedId = "";
      previousGeneratedPersonName = "";
      return [];
    }

    const inviteName = getCell(values, columnIndex, "invite_name");
    const personName =
      getCell(values, columnIndex, "person_name") ||
      getCell(values, columnIndex, "name");
    const sourceName = inviteName || personName;
    if (!sourceName.trim()) return [];

    const inviteGroupKey = buildInviteGroupKey(inviteName);
    const normalizedPersonName = personName.trim().toLowerCase();
    const hasExistingSamePerson =
      inviteGroupKey &&
      existingPersonNamesByInviteGroup
        .get(inviteGroupKey)
        ?.has(normalizedPersonName);
    let nextId =
      inviteGroupKey && !hasExistingSamePerson
        ? existingIdsByInviteGroup.get(inviteGroupKey) || ""
        : "";

    if (
      !nextId &&
      inviteGroupKey &&
      inviteGroupKey === previousGeneratedInviteGroupKey &&
      normalizedPersonName !== previousGeneratedPersonName
    ) {
      nextId = previousGeneratedId;
    }

    if (!nextId) {
      const baseId = slugifyInviteId(sourceName);
      nextId = baseId;
      let suffix = 2;

      while (usedIds.has(nextId.toLowerCase())) {
        nextId = `${baseId}-${suffix}`;
        suffix += 1;
      }

      usedIds.add(nextId.toLowerCase());
    }

    previousGeneratedInviteGroupKey = inviteGroupKey;
    previousGeneratedId = nextId;
    previousGeneratedPersonName = normalizedPersonName;

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
    ["admin_label", update.adminLabel],
    ["person_type", update.personType],
    ["child_age", update.childAge],
    ["prompt", update.prompt],
    ["invite_text", update.inviteText],
    ["no_declension", update.noDeclension ? "true" : ""],
    ["informal_tone", update.informalTone ? "true" : ""],
    ["invite_url", update.inviteUrl],
  ];

  let nextHeaderCount = headerCount;
  for (const key of [
    "prompt",
    "admin_label",
    "invite_text",
    "no_declension",
    "informal_tone",
    "invite_url",
  ] as const) {
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
  const { people, columnIndex, headerCount } = await fetchGuestRows();
  const matchingPeople = people.filter(
    (person) => person.id.toLowerCase() === id.toLowerCase(),
  );

  if (!matchingPeople.length) {
    throw new Error(`Invite not found: ${id}`);
  }

  const inviteUrlIndex =
    inviteUrl === undefined
      ? null
      : await ensureGuestColumn(sheetName, columnIndex, headerCount, "invite_url");
  const inviteUrlColumn =
    inviteUrlIndex === null ? null : columnLetter(inviteUrlIndex);

  await ensureInviteMetaSheet();
  const metaResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: getGoogleSpreadsheetId(),
    range: `${INVITE_META_SHEET_NAME}!A:D`,
  });
  const metaRows = metaResponse.data.values ?? [];
  const [, ...metaDataRows] = metaRows;
  const existingMetaIndex = metaDataRows.findIndex(
    (row) => String(row[0] ?? "").trim().toLowerCase() === id.toLowerCase(),
  );
  const metaRow = existingMetaIndex === -1 ? metaRows.length + 1 : existingMetaIndex + 2;
  const updatedAt = new Date().toISOString();

  const updates = [
    {
      range: `${INVITE_META_SHEET_NAME}!A${metaRow}:D${metaRow}`,
      values: [[id, bgUrl, status, updatedAt]],
    },
    ...(inviteUrlColumn && inviteUrl !== undefined
      ? matchingPeople.map((person) => ({
          range: `${sheetName}!${inviteUrlColumn}${person.sheetRow}`,
          values: [[inviteUrl]],
        }))
      : []),
  ];

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: getGoogleSpreadsheetId(),
    requestBody: {
      valueInputOption: "USER_ENTERED",
      data: updates,
    },
  });
}

export const updateGuestBackground = updateInviteBackground;
