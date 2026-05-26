/**
 * Google Apps Script for the Guests sheet.
 *
 * Setup:
 * 1. Replace WEBHOOK_URL with your deployed endpoint:
 *    https://your-domain.vercel.app/api/generate-invite-bg
 * 2. Replace WEBHOOK_SECRET with GENERATE_BG_WEBHOOK_SECRET.
 * 3. Paste this script into Extensions -> Apps Script in your Google Sheet.
 * 4. Reload the sheet. Use menu: Wedding -> Generate all pending backgrounds.
 *
 * Guests headers expected:
 * id | invite_name | person_name | person_type | child_age | bg_url | status
 */

const WEBHOOK_URL = "https://YOUR_DOMAIN.vercel.app/api/generate-invite-bg";
const WEBHOOK_SECRET = "YOUR_WEBHOOK_SECRET";
const GUESTS_SHEET_NAME = "Guests";

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Wedding")
    .addItem("Generate all pending backgrounds", "generateAllPendingInviteBackgrounds")
    .addItem("Generate selected invite background", "generateSelectedInviteBackground")
    .addToUi();
}

function normalizeHeader(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "_");
}

function getHeaderMap(sheet) {
  const lastColumn = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  const map = {};

  headers.forEach(function (header, index) {
    map[normalizeHeader(header)] = index + 1;
  });

  return map;
}

function getRequiredColumn(headerMap, name) {
  if (!headerMap[name]) {
    throw new Error('Missing Guests column: "' + name + '"');
  }
  return headerMap[name];
}

function shouldGenerate(bgUrl, status) {
  const normalizedStatus = String(status || "").trim().toLowerCase();
  return !bgUrl && normalizedStatus !== "pending" && normalizedStatus !== "done";
}

function getPendingInviteIds() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(GUESTS_SHEET_NAME);
  if (!sheet) throw new Error("Sheet not found: " + GUESTS_SHEET_NAME);

  const headerMap = getHeaderMap(sheet);
  const idColumn = getRequiredColumn(headerMap, "id");
  const bgUrlColumn = getRequiredColumn(headerMap, "bg_url");
  const statusColumn = getRequiredColumn(headerMap, "status");
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  const ids = [];
  const seen = {};

  values.forEach(function (row) {
    const id = String(row[idColumn - 1] || "").trim();
    const bgUrl = row[bgUrlColumn - 1];
    const status = row[statusColumn - 1];

    if (id && !seen[id] && shouldGenerate(bgUrl, status)) {
      seen[id] = true;
      ids.push(id);
    }
  });

  return ids;
}

function generateAllPendingInviteBackgrounds() {
  const ids = getPendingInviteIds();
  Logger.log("Pending invite ids: " + ids.join(", "));

  ids.forEach(function (id, index) {
    Logger.log("Generating " + (index + 1) + "/" + ids.length + ": " + id);
    triggerBackgroundGeneration(id);

    // Small pause to avoid hammering Vercel/OpenAI/Google APIs.
    Utilities.sleep(1500);
  });

  SpreadsheetApp.getActive().toast(
    "Background generation started for " + ids.length + " invite(s).",
    "Wedding",
    8,
  );
}

function generateSelectedInviteBackground() {
  const sheet = SpreadsheetApp.getActive().getActiveSheet();
  if (sheet.getName() !== GUESTS_SHEET_NAME) {
    throw new Error("Open the Guests sheet first.");
  }

  const row = sheet.getActiveRange().getRow();
  if (row < 2) return;

  const headerMap = getHeaderMap(sheet);
  const idColumn = getRequiredColumn(headerMap, "id");
  const id = String(sheet.getRange(row, idColumn).getValue() || "").trim();

  if (!id) throw new Error("Selected row has no id.");
  triggerBackgroundGeneration(id);
}

/**
 * Optional installable trigger:
 * on edit, if a row gets an id and still has empty bg_url/status,
 * generate this invite background.
 */
function onGuestsSheetEdit(e) {
  if (!e || e.range.getSheet().getName() !== GUESTS_SHEET_NAME) return;

  const sheet = e.range.getSheet();
  const row = e.range.getRow();
  if (row < 2) return;

  const headerMap = getHeaderMap(sheet);
  const idColumn = getRequiredColumn(headerMap, "id");
  const bgUrlColumn = getRequiredColumn(headerMap, "bg_url");
  const statusColumn = getRequiredColumn(headerMap, "status");

  const id = String(sheet.getRange(row, idColumn).getValue() || "").trim();
  const bgUrl = sheet.getRange(row, bgUrlColumn).getValue();
  const status = sheet.getRange(row, statusColumn).getValue();

  if (!id || !shouldGenerate(bgUrl, status)) return;
  triggerBackgroundGeneration(id);
}

function triggerBackgroundGeneration(guestId) {
  const options = {
    method: "post",
    contentType: "application/json",
    headers: { "x-webhook-secret": WEBHOOK_SECRET },
    payload: JSON.stringify({ guestId: guestId }),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(WEBHOOK_URL, options);
  Logger.log(response.getResponseCode() + " " + response.getContentText());
}
