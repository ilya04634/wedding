/**
 * Google Apps Script for the Guests sheet.
 *
 * Setup:
 * 1. Replace WEBHOOK_URL with your deployed endpoint:
 *    https://your-domain.vercel.app/api/generate-invite-bg
 * 2. Replace WEBHOOK_SECRET with GENERATE_BG_WEBHOOK_SECRET.
 * 3. Optional but recommended: deploy this Apps Script as a Web App and paste
 *    the deployment URL into WEB_APP_URL.
 * 4. Paste this script into Extensions -> Apps Script in your Google Sheet.
 * 5. Reload the sheet. Use menu: Wedding -> Open generator panel.
 *
 * Guests headers expected:
 * id | invite_name | person_name | invite_text | person_type | child_age | prompt | bg_url | invite_url | status
 *
 * bg_url is a technical Google Drive image URL.
 * invite_url is the public site URL you send to guests.
 */

const WEBHOOK_URL = "";
const WEBHOOK_SECRET = "";
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwU3iGa-i1A1lMyuQwL2AWpBy8OGKkAxVFQATUkNZ0wNvAot5lYLQB8cJDzC3pnJQMo/exec";
const GUESTS_SHEET_NAME = "Guests";

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Wedding")
    .addItem("Open generator panel", "openBackgroundGeneratorPanel")
    .addSeparator()
    .addItem("Direct: generate all pending backgrounds", "generateAllPendingInviteBackgrounds")
    .addItem("Direct: generate selected invite background", "generateSelectedInviteBackground")
    .addToUi();
}

function buildUrl(baseUrl, params) {
  const parts = [];
  Object.keys(params).forEach(function (key) {
    if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
      parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
    }
  });

  return baseUrl + (baseUrl.indexOf("?") === -1 ? "?" : "&") + parts.join("&");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getActiveInviteId() {
  const sheet = SpreadsheetApp.getActive().getActiveSheet();
  if (sheet.getName() !== GUESTS_SHEET_NAME) return "";

  const row = sheet.getActiveRange().getRow();
  if (row < 2) return "";

  const headerMap = getHeaderMap(sheet);
  const idColumn = getRequiredColumn(headerMap, "id");
  return String(sheet.getRange(row, idColumn).getValue() || "").trim();
}

function openBackgroundGeneratorPanel() {
  if (!WEB_APP_URL) {
    SpreadsheetApp.getUi().alert(
      "Set WEB_APP_URL to your Apps Script Web App deployment URL first.",
    );
    return;
  }

  const spreadsheetId = SpreadsheetApp.getActive().getId();
  const selectedInviteId = getActiveInviteId();
  const allUrl = buildUrl(WEB_APP_URL, {
    action: "all",
    spreadsheetId: spreadsheetId,
  });
  const selectedUrl = selectedInviteId
    ? buildUrl(WEB_APP_URL, {
        action: "one",
        spreadsheetId: spreadsheetId,
        guestId: selectedInviteId,
      })
    : "";

  const html = HtmlService.createHtmlOutput(
    '<div style="font-family:Arial,sans-serif;padding:16px;line-height:1.45">' +
      '<h2 style="margin:0 0 12px">Wedding generator</h2>' +
      '<p>Use the deployed Web App to generate invite backgrounds and invite URLs.</p>' +
      '<p><a target="_blank" href="' + escapeHtml(allUrl) + '">Generate all pending invites</a></p>' +
      (selectedUrl
        ? '<p><a target="_blank" href="' + escapeHtml(selectedUrl) + '">Generate selected invite: ' +
          escapeHtml(selectedInviteId) +
          "</a></p>"
        : '<p>Select a Guests row to get a selected invite link.</p>') +
      '<p style="color:#666;font-size:12px">bg_url is the Drive image. invite_url is the link to send to guests.</p>' +
      "</div>",
  )
    .setWidth(420)
    .setHeight(260);

  SpreadsheetApp.getUi().showModalDialog(html, "Wedding generator");
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

function shouldCallWebhook(bgUrl, inviteUrl, status) {
  const normalizedStatus = String(status || "").trim().toLowerCase();
  if (normalizedStatus === "pending") return false;
  if (!inviteUrl) return true;
  return !bgUrl && normalizedStatus !== "done";
}

function getSpreadsheetByIdOrActive(spreadsheetId) {
  return spreadsheetId
    ? SpreadsheetApp.openById(spreadsheetId)
    : SpreadsheetApp.getActive();
}

function getPendingInviteIds(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(GUESTS_SHEET_NAME);
  if (!sheet) throw new Error("Sheet not found: " + GUESTS_SHEET_NAME);

  const headerMap = getHeaderMap(sheet);
  const idColumn = getRequiredColumn(headerMap, "id");
  const bgUrlColumn = getRequiredColumn(headerMap, "bg_url");
  const inviteUrlColumn = headerMap.invite_url || null;
  const statusColumn = getRequiredColumn(headerMap, "status");
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  const ids = [];
  const seen = {};

  values.forEach(function (row) {
    const id = String(row[idColumn - 1] || "").trim();
    const bgUrl = row[bgUrlColumn - 1];
    const inviteUrl = inviteUrlColumn ? row[inviteUrlColumn - 1] : "";
    const status = row[statusColumn - 1];

    if (id && !seen[id] && shouldCallWebhook(bgUrl, inviteUrl, status)) {
      seen[id] = true;
      ids.push(id);
    }
  });

  return ids;
}

function generateAllPendingInviteBackgrounds() {
  const ids = getPendingInviteIds(SpreadsheetApp.getActive());
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

function generateAllPendingInviteBackgroundsForSpreadsheet(spreadsheetId) {
  const spreadsheet = getSpreadsheetByIdOrActive(spreadsheetId);
  const ids = getPendingInviteIds(spreadsheet);
  const results = [];

  ids.forEach(function (id, index) {
    Logger.log("Generating " + (index + 1) + "/" + ids.length + ": " + id);
    results.push(triggerBackgroundGeneration(id));
    Utilities.sleep(1500);
  });

  return {
    total: ids.length,
    results: results,
  };
}

function generateOneInviteBackgroundForSpreadsheet(spreadsheetId, guestId) {
  if (!guestId) throw new Error("guestId is required");
  getSpreadsheetByIdOrActive(spreadsheetId);

  return {
    total: 1,
    results: [triggerBackgroundGeneration(guestId)],
  };
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
  const inviteUrlColumn = headerMap.invite_url || null;
  const statusColumn = getRequiredColumn(headerMap, "status");

  const id = String(sheet.getRange(row, idColumn).getValue() || "").trim();
  const bgUrl = sheet.getRange(row, bgUrlColumn).getValue();
  const inviteUrl = inviteUrlColumn ? sheet.getRange(row, inviteUrlColumn).getValue() : "";
  const status = sheet.getRange(row, statusColumn).getValue();

  if (!id || !shouldCallWebhook(bgUrl, inviteUrl, status)) return;
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
  const responseCode = response.getResponseCode();
  const responseText = response.getContentText();
  Logger.log(responseCode + " " + responseText);

  try {
    const data = JSON.parse(responseText);
    if (data.inviteUrl) {
      Logger.log("Guest invite URL: " + data.inviteUrl);
    }
    return {
      guestId: guestId,
      code: responseCode,
      ok: Boolean(data.ok),
      skipped: Boolean(data.skipped),
      inviteUrl: data.inviteUrl || "",
      bgUrl: data.bgUrl || "",
      error: data.error || "",
      message: data.message || "",
    };
  } catch (error) {
    Logger.log("Could not parse webhook response JSON.");
    return {
      guestId: guestId,
      code: responseCode,
      ok: responseCode >= 200 && responseCode < 300,
      skipped: false,
      inviteUrl: "",
      bgUrl: "",
      error: "Invalid webhook JSON",
      message: responseText,
    };
  }
}

function renderResultPage(title, result) {
  const rows = (result.results || [])
    .map(function (item) {
      const status = item.ok ? (item.skipped ? "skipped" : "done") : "error";
      const inviteLink = item.inviteUrl
        ? '<a target="_blank" href="' + escapeHtml(item.inviteUrl) + '">' + escapeHtml(item.inviteUrl) + "</a>"
        : "";
      const message = item.error || item.message || "";

      return (
        "<tr>" +
        "<td>" + escapeHtml(item.guestId) + "</td>" +
        "<td>" + escapeHtml(status) + "</td>" +
        "<td>" + inviteLink + "</td>" +
        "<td>" + escapeHtml(message) + "</td>" +
        "</tr>"
      );
    })
    .join("");

  return HtmlService.createHtmlOutput(
    '<div style="font-family:Arial,sans-serif;padding:20px;line-height:1.45">' +
      "<h1>" + escapeHtml(title) + "</h1>" +
      "<p>Total processed: " + escapeHtml(result.total) + "</p>" +
      '<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse">' +
      "<thead><tr><th>guestId</th><th>status</th><th>invite_url</th><th>message</th></tr></thead>" +
      "<tbody>" + rows + "</tbody>" +
      "</table>" +
      "</div>",
  );
}

function renderErrorPage(error) {
  return HtmlService.createHtmlOutput(
    '<div style="font-family:Arial,sans-serif;padding:20px;line-height:1.45">' +
      "<h1>Wedding generator error</h1>" +
      "<pre>" + escapeHtml(error && error.stack ? error.stack : error) + "</pre>" +
      "</div>",
  );
}

function doGet(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};
    const action = params.action || "panel";
    const spreadsheetId = params.spreadsheetId || "";

    if (action === "all") {
      const result = generateAllPendingInviteBackgroundsForSpreadsheet(spreadsheetId);
      return renderResultPage("Generate all pending invites", result);
    }

    if (action === "one") {
      const result = generateOneInviteBackgroundForSpreadsheet(
        spreadsheetId,
        params.guestId || "",
      );
      return renderResultPage("Generate selected invite", result);
    }

    return HtmlService.createHtmlOutput(
      '<div style="font-family:Arial,sans-serif;padding:20px;line-height:1.45">' +
        "<h1>Wedding generator</h1>" +
        "<p>Open this Web App from the Wedding menu inside Google Sheets.</p>" +
        "</div>",
    );
  } catch (error) {
    return renderErrorPage(error);
  }
}
