# Структура Google Таблицы

Одна таблица (`SPREADSHEET_ID`), два листа.

## Лист `Guests` (персональные приглашения)

| Колонка | Описание | Пример |
|---------|----------|--------|
| `id` | Уникальный алиас в URL | `ivan` |
| `name` | Имя для обращения | `Иван` |
| `bg_url` | Публичный URL фона (Google Drive) | `https://drive.google.com/uc?export=view&id=...` |
| `status` | `pending` / `done` / `error` | `done` |

**Ссылка гостю:** `https://ваш-сайт.vercel.app/i/ivan`

## Лист `RSVP` (ответы)

| Колонка | Описание |
|---------|----------|
| `Timestamp` | ISO-дата отправки |
| `Guest_Id` | Алиас из `?guestId=` |
| `Guest_Name` | Имя из формы |
| `Will_Attend` | Точно буду / Пока не уверен / Не смогу |
| `Plus_One` | Партнёр: имя, «Да» или «Нет» |
| `With_Children` | Да / Нет |
| `Children_List` | Сводка: «Маша — 5 лет; Петя — 3 года» |
| `Children_Names` | Имена через `;` |
| `Children_Ages` | Возрасты через `;` (в том же порядке) |
| `Alcohol_Pref` | Напитки |
| `Food_Allergies` | Аллергии и пожелания |

**Первая строка** — заголовки (скопируйте строку выше в таблицу).

## Доступ сервисного аккаунта

`CLIENT_EMAIL` → **Редактор** на таблицу и на папки Drive.

## AI-фоны (DALL-E 3 → Drive)

### Переменные `.env.local`

```env
OPENAI_API_KEY=sk-...
GENERATE_BG_WEBHOOK_SECRET=случайная_длинная_строка
INVITE_BG_FOLDER_ID=id_папки_для_фонов   # опционально, иначе FOLDER_ID
```

### Папка Drive

1. Создайте папку «Invite Backgrounds» (или используйте существующую).
2. Поделитесь с `CLIENT_EMAIL` (Редактор).
3. ID папки → `INVITE_BG_FOLDER_ID`.

### Запуск генерации

1. Добавьте строку на лист `Guests` (id + name, `bg_url` пустой).
2. Apps Script из `scripts/google-apps-script-generate-bg.gs` вызовет  
   `POST /api/generate-invite-bg` с заголовком `x-webhook-secret`.
3. Сервер: DALL-E → скачивание → загрузка в Drive → публичная ссылка в `bg_url`, `status=done`.

Ручной тест (после деплоя):

```bash
curl -X POST https://ваш-сайт/api/generate-invite-bg \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: ВАШ_СЕКРЕТ" \
  -d "{\"guestId\":\"ivan\"}"
```
