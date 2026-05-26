import "server-only";

import { getGoogleSpreadsheetId } from "./auth";
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

function getDefaultMaxUses() {
  const raw = Number(process.env.BACKGROUND_POOL_MAX_USES ?? 4);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 4;
}

function nowIso() {
  return new Date().toISOString();
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
        styleKey: getCell(values, columnIndex, "style_key") || DEFAULT_STYLE_KEY,
        usedCount: parsePositiveInt(getCell(values, columnIndex, "used_count"), 0),
        maxUses,
        status: getCell(values, columnIndex, "status") || "active",
      };
    })
    .filter((row) => row.bgUrl);

  return { rows, columnIndex };
}

export async function claimReusableBackgroundFromPool(
  styleKey = DEFAULT_STYLE_KEY,
): Promise<BackgroundPoolClaim | null> {
  const { rows, columnIndex } = await getPoolRows();
  const normalizedStyleKey = styleKey.trim() || DEFAULT_STYLE_KEY;
  const candidate = rows
    .filter(
      (row) =>
        row.status.toLowerCase() === "active" &&
        row.styleKey === normalizedStyleKey &&
        row.usedCount < row.maxUses,
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
