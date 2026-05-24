/**
 * Google Apps Script — вставьте в Расширения → Apps Script в вашей таблице.
 *
 * 1. Замените WEBHOOK_URL на URL деплоя: https://ваш-домен.vercel.app/api/generate-invite-bg
 * 2. Замените WEBHOOK_SECRET на значение GENERATE_BG_WEBHOOK_SECRET из .env
 * 3. Создайте триггер: При редактировании → onGuestsSheetEdit (лист Guests)
 *
 * Генерация: DALL-E 3 → загрузка в Google Drive → постоянный bg_url в таблице.
 */

const WEBHOOK_URL = "https://YOUR_DOMAIN.vercel.app/api/generate-invite-bg";
const WEBHOOK_SECRET = "YOUR_WEBHOOK_SECRET";
const GUESTS_SHEET_NAME = "Guests";

/**
 * Срабатывает при редактировании листа Guests.
 * Если добавлена новая строка с id и пустым bg_url — вызывает webhook.
 */
function onGuestsSheetEdit(e) {
  if (!e || e.range.getSheet().getName() !== GUESTS_SHEET_NAME) return;

  const sheet = e.range.getSheet();
  const row = e.range.getRow();
  if (row < 2) return;

  const id = sheet.getRange(row, 1).getValue();
  const bgUrl = sheet.getRange(row, 3).getValue();
  const status = sheet.getRange(row, 4).getValue();

  if (!id || bgUrl || status === "pending" || status === "done") return;

  triggerBackgroundGeneration(String(id).trim());
}

/**
 * Ручной запуск для строки (Меню или из редактора).
 */
function triggerBackgroundGeneration(guestId) {
  const options = {
    method: "post",
    contentType: "application/json",
    headers: { "x-webhook-secret": WEBHOOK_SECRET },
    payload: JSON.stringify({ guestId: guestId }),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(WEBHOOK_URL, options);
  Logger.log(response.getContentText());
}
