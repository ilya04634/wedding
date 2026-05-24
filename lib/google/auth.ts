/**
 * Аутентификация Google Service Account.
 * См. .env.example и README.md
 */

import "server-only";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(
      `Отсутствует переменная окружения ${name}. Скопируйте .env.example → .env.local.`,
    );
  }
  return value;
}

export function getGoogleClientEmail(): string {
  return requireEnv("CLIENT_EMAIL");
}

export function getGooglePrivateKey(): string {
  const raw = requireEnv("PRIVATE_KEY");
  return raw.replace(/\\n/g, "\n");
}

/** Папка для фото/видео гостей с банкета */
export function getGoogleDriveFolderId(): string {
  return requireEnv("FOLDER_ID");
}

/** Папка Drive для AI-фонов приглашений (если не задана — используется FOLDER_ID) */
export function getInviteBgFolderId(): string {
  const dedicated = process.env.INVITE_BG_FOLDER_ID?.trim();
  if (dedicated) return dedicated;
  return getGoogleDriveFolderId();
}

export function getGoogleSpreadsheetId(): string {
  return requireEnv("SPREADSHEET_ID");
}

/** Лист RSVP (ответы гостей) */
export function getRsvpSheetName(): string {
  return process.env.RSVP_SHEET_NAME?.trim() || "RSVP";
}

/** Лист Guests (персональные приглашения) */
export function getGuestsSheetName(): string {
  return process.env.GUESTS_SHEET_NAME?.trim() || "Guests";
}

/** @deprecated используйте getRsvpSheetName */
export function getGoogleSpreadsheetSheetName(): string {
  return getRsvpSheetName();
}
