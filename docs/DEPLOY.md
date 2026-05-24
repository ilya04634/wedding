# Деплой на Vercel

## 1. Вход в CLI (один раз)

```powershell
cd "c:\вся\визитка на свадьбу"
npx vercel login
```

## 2. Переменные окружения на Vercel

В [Vercel Dashboard](https://vercel.com) → Project → **Settings → Environment Variables** добавьте **все** ключи из `.env.local`:

| Переменная | Production | Preview |
|------------|------------|---------|
| `CLIENT_EMAIL` | ✓ | ✓ |
| `PRIVATE_KEY` | ✓ | ✓ |
| `SPREADSHEET_ID` | ✓ | ✓ |
| `FOLDER_ID` | ✓ | ✓ |
| `INVITE_BG_FOLDER_ID` | ✓ | ✓ |
| `OPENAI_API_KEY` | ✓ | ✓ |
| `GENERATE_BG_WEBHOOK_SECRET` | ✓ | ✓ |
| `GUESTS_SHEET_NAME` | ✓ | ✓ |
| `RSVP_SHEET_NAME` | ✓ | ✓ |

`PRIVATE_KEY` вставляйте **в кавычках**, с `\n` вместо переносов строк.

## 3. Деплой

```powershell
npx vercel deploy --prod
```

После деплоя скопируйте URL (например `https://wedding-invitation-xxx.vercel.app`).

## 4. Apps Script для фонов

В `scripts/google-apps-script-generate-bg.gs` замените:

```javascript
const WEBHOOK_URL = "https://ВАШ-ДОМЕН.vercel.app/api/generate-invite-bg";
const WEBHOOK_SECRET = "тот же что GENERATE_BG_WEBHOOK_SECRET";
```

## 5. Проверка генерации фона

```powershell
curl -X POST "https://ВАШ-ДОМЕН.vercel.app/api/generate-invite-bg" `
  -H "Content-Type: application/json" `
  -H "x-webhook-secret: ВАШ_СЕКРЕТ" `
  -d '{\"guestId\":\"test\"}'
```

Затем откройте `/i/test` и проверьте `bg_url` в листе Guests.
