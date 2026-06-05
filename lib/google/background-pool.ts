import "server-only";

import type { GuestInvite } from "@/types/guest";
import { getGoogleSpreadsheetId } from "./auth";
import { getDriveClient } from "./drive-client";
import { extractDriveFileId } from "./drive-image";
import { getSheetsClient } from "./sheets-client";

const BACKGROUND_POOL_SHEET_NAME =
  process.env.BACKGROUND_POOL_SHEET_NAME?.trim() || "BackgroundPool";
const DEFAULT_STYLE_KEY = "default";
const POOL_COLUMNS = [
  "bg_id",
  "bg_url",
  "style_key",
  "used_count",
  "max_uses",
  "status",
  "created_at",
  "last_used_at",
  "source_invite_id",
  "notes",
] as const;

type PoolColumn = (typeof POOL_COLUMNS)[number];
type ColumnIndex = Partial<Record<PoolColumn, number>>;

interface PoolRow {
  sheetRow: number;
  bgId: string;
  bgUrl: string;
  sourceInviteId: string;
  styleKey: string;
  usedCount: number;
  maxUses: number;
  status: string;
}

export interface BackgroundPoolClaim {
  bgId: string;
  bgUrl: string;
  usedCount: number;
  maxUses: number;
}

interface ClaimReusableBackgroundOptions {
  ignoreMaxUses?: boolean;
}

function getDefaultMaxUses() {
  const raw = Number(process.env.BACKGROUND_POOL_MAX_USES ?? 4);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 4;
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeBgUrl(value: string) {
  return value.trim();
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

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function buildColumnIndex(headerRow: unknown[]): ColumnIndex {
  const columnIndex: ColumnIndex = {};

  headerRow.forEach((cell, index) => {
    const key = normalizeHeader(String(cell));
    if ((POOL_COLUMNS as readonly string[]).includes(key)) {
      columnIndex[key as PoolColumn] = index;
    }
  });

  return columnIndex;
}

function getCell(row: string[], columnIndex: ColumnIndex, key: PoolColumn) {
  const index = columnIndex[key];
  return index === undefined ? "" : row[index]?.trim() ?? "";
}

function parsePositiveInt(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : fallback;
}

function requireColumn(columnIndex: ColumnIndex, key: PoolColumn): number {
  const index = columnIndex[key];
  if (index === undefined) {
    throw new Error(`BackgroundPool sheet must contain ${key} column`);
  }
  return index;
}

async function ensureBackgroundPoolSheet(): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = getGoogleSpreadsheetId();
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });

  const exists = spreadsheet.data.sheets?.some(
    (sheet) => sheet.properties?.title === BACKGROUND_POOL_SHEET_NAME,
  );

  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: BACKGROUND_POOL_SHEET_NAME,
              },
            },
          },
        ],
      },
    });
  }

  const values = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${BACKGROUND_POOL_SHEET_NAME}!A1:J1`,
  });

  if (!values.data.values?.[0]?.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${BACKGROUND_POOL_SHEET_NAME}!A1:J1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[...POOL_COLUMNS]] },
    });
  }
}

async function getPoolRows(): Promise<{
  rows: PoolRow[];
  columnIndex: ColumnIndex;
}> {
  await ensureBackgroundPoolSheet();

  const sheets = getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: getGoogleSpreadsheetId(),
    range: `${BACKGROUND_POOL_SHEET_NAME}!A:J`,
  });

  const values = response.data.values ?? [];
  if (!values.length) return { rows: [], columnIndex: {} };

  const [headerRow, ...dataRows] = values;
  const columnIndex = buildColumnIndex(headerRow);

  const rows = dataRows
    .map((row, index) => {
      const values = row.map(String);
      const maxUses = parsePositiveInt(
        getCell(values, columnIndex, "max_uses"),
        getDefaultMaxUses(),
      );

      return {
        sheetRow: index + 2,
        bgId: getCell(values, columnIndex, "bg_id"),
        bgUrl: getCell(values, columnIndex, "bg_url"),
        sourceInviteId: getCell(values, columnIndex, "source_invite_id"),
        styleKey: getCell(values, columnIndex, "style_key") || DEFAULT_STYLE_KEY,
        usedCount: parsePositiveInt(getCell(values, columnIndex, "used_count"), 0),
        maxUses,
        status: getCell(values, columnIndex, "status") || "active",
      };
    })
    .filter((row) => row.bgUrl);

  return { rows, columnIndex };
}

function formatInviteUsageLabel(invite: GuestInvite) {
  const name = invite.inviteName?.trim() || invite.id;
  return `${name} (${invite.id})`;
}

function buildUsageByBgUrl(invites: GuestInvite[]) {
  const usageByBgUrl = new Map<
    string,
    { count: number; firstInviteId: string; labels: string[] }
  >();

  invites.forEach((invite) => {
    const bgUrl = normalizeBgUrl(invite.bgUrl ?? "");
    if (!bgUrl || !invite.id) return;

    const current = usageByBgUrl.get(bgUrl) ?? {
      count: 0,
      firstInviteId: invite.id,
      labels: [],
    };

    current.count += 1;
    current.labels.push(formatInviteUsageLabel(invite));
    usageByBgUrl.set(bgUrl, current);
  });

  return usageByBgUrl;
}

function formatUsageNotes(labels: string[]) {
  if (!labels.length) return "";
  return `Используется: ${labels.join("; ")}`;
}

async function isDriveBackgroundAvailable(bgUrl: string) {
  const fileId = extractDriveFileId(bgUrl);
  if (!fileId) return false;

  try {
    const drive = getDriveClient();
    const response = await drive.files.get({
      fileId,
      fields: "id,trashed",
      supportsAllDrives: true,
    });

    return response.data.trashed !== true;
  } catch (error) {
    console.warn("[background-pool] Drive API availability check failed", {
      fileId,
      error,
    });
  }

  try {
    const url = new URL("https://drive.google.com/uc");
    url.searchParams.set("export", "download");
    url.searchParams.set("id", fileId);

    const response = await fetch(url, { redirect: "follow" });
    const contentType = response.headers.get("content-type") || "";
    return response.ok && !contentType.includes("text/html");
  } catch (error) {
    console.warn("[background-pool] Public availability check failed", {
      fileId,
      error,
    });
    return false;
  }
}

export interface SyncBackgroundPoolResult {
  added: number;
  missing: number;
  updated: number;
}

export async function syncBackgroundPoolFromInvites(
  invites: GuestInvite[],
): Promise<SyncBackgroundPoolResult> {
  const sheets = getSheetsClient();
  const spreadsheetId = getGoogleSpreadsheetId();
  const { rows, columnIndex } = await getPoolRows();
  const usageByBgUrl = buildUsageByBgUrl(invites);
  const existingBgUrls = new Set(rows.map((row) => normalizeBgUrl(row.bgUrl)));
  const timestamp = nowIso();
  const usedCountColumn = columnLetter(requireColumn(columnIndex, "used_count"));
  const statusColumn = columnLetter(requireColumn(columnIndex, "status"));
  const lastUsedAtColumn = columnLetter(requireColumn(columnIndex, "last_used_at"));
  const notesColumn = columnLetter(requireColumn(columnIndex, "notes"));
  const updates: { range: string; values: string[][] }[] = [];
  const inserts: string[][] = [];
  let missing = 0;

  for (const row of rows) {
    const bgUrl = normalizeBgUrl(row.bgUrl);
    const usage = usageByBgUrl.get(bgUrl);
    const isAvailable = await isDriveBackgroundAvailable(bgUrl);
    const nextStatus = isAvailable
      ? row.status.toLowerCase() === "missing"
        ? "active"
        : row.status || "active"
      : "missing";

    if (!isAvailable) missing += 1;

    updates.push(
      {
        range: `${BACKGROUND_POOL_SHEET_NAME}!${usedCountColumn}${row.sheetRow}`,
        values: [[String(usage?.count ?? 0)]],
      },
      {
        range: `${BACKGROUND_POOL_SHEET_NAME}!${statusColumn}${row.sheetRow}`,
        values: [[nextStatus]],
      },
      {
        range: `${BACKGROUND_POOL_SHEET_NAME}!${lastUsedAtColumn}${row.sheetRow}`,
        values: [[usage?.count ? timestamp : ""]],
      },
      {
        range: `${BACKGROUND_POOL_SHEET_NAME}!${notesColumn}${row.sheetRow}`,
        values: [[formatUsageNotes(usage?.labels ?? [])]],
      },
    );
  }

  for (const [bgUrl, usage] of Array.from(usageByBgUrl.entries())) {
    if (existingBgUrls.has(bgUrl)) continue;

    const isAvailable = await isDriveBackgroundAvailable(bgUrl);
    if (!isAvailable) missing += 1;

    inserts.push([
      `pool-${Date.now()}-${inserts.length + 1}-${usage.firstInviteId.replace(/[^a-zA-Z0-9_-]/g, "_")}`,
      bgUrl,
      DEFAULT_STYLE_KEY,
      String(usage.count),
      String(getDefaultMaxUses()),
      isAvailable ? "active" : "missing",
      timestamp,
      timestamp,
      usage.firstInviteId,
      formatUsageNotes(usage.labels),
    ]);
  }

  if (updates.length) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data: updates,
      },
    });
  }

  if (inserts.length) {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${BACKGROUND_POOL_SHEET_NAME}!A:J`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: inserts,
      },
    });
  }

  return {
    added: inserts.length,
    missing,
    updated: rows.length,
  };
}

export async function claimReusableBackgroundFromPool(
  styleKey = DEFAULT_STYLE_KEY,
  options: ClaimReusableBackgroundOptions = {},
): Promise<BackgroundPoolClaim | null> {
  const { rows, columnIndex } = await getPoolRows();
  const normalizedStyleKey = styleKey.trim() || DEFAULT_STYLE_KEY;
  const ignoreMaxUses = options.ignoreMaxUses ?? false;
  const candidate = rows
    .filter(
      (row) =>
        row.status.toLowerCase() === "active" &&
        row.styleKey === normalizedStyleKey &&
        (ignoreMaxUses || row.usedCount < row.maxUses),
    )
    .sort((a, b) => a.usedCount - b.usedCount || a.sheetRow - b.sheetRow)[0];

  if (!candidate) return null;

  const sheets = getSheetsClient();
  const usedCountColumn = columnLetter(requireColumn(columnIndex, "used_count"));
  const lastUsedAtColumn = columnLetter(requireColumn(columnIndex, "last_used_at"));
  const nextUsedCount = candidate.usedCount + 1;

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: getGoogleSpreadsheetId(),
    requestBody: {
      valueInputOption: "USER_ENTERED",
      data: [
        {
          range: `${BACKGROUND_POOL_SHEET_NAME}!${usedCountColumn}${candidate.sheetRow}`,
          values: [[String(nextUsedCount)]],
        },
        {
          range: `${BACKGROUND_POOL_SHEET_NAME}!${lastUsedAtColumn}${candidate.sheetRow}`,
          values: [[nowIso()]],
        },
      ],
    },
  });

  return {
    bgId: candidate.bgId,
    bgUrl: candidate.bgUrl,
    usedCount: nextUsedCount,
    maxUses: candidate.maxUses,
  };
}

export async function addBackgroundToPool({
  bgUrl,
  sourceInviteId,
  styleKey = DEFAULT_STYLE_KEY,
  notes = "",
}: {
  bgUrl: string;
  sourceInviteId: string;
  styleKey?: string;
  notes?: string;
}) {
  await ensureBackgroundPoolSheet();

  const bgId = `pool-${Date.now()}-${sourceInviteId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  const timestamp = nowIso();

  await getSheetsClient().spreadsheets.values.append({
    spreadsheetId: getGoogleSpreadsheetId(),
    range: `${BACKGROUND_POOL_SHEET_NAME}!A:J`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          bgId,
          bgUrl,
          styleKey.trim() || DEFAULT_STYLE_KEY,
          "1",
          String(getDefaultMaxUses()),
          "active",
          timestamp,
          timestamp,
          sourceInviteId,
          notes,
        ],
      ],
    },
  });

  return bgId;
}
