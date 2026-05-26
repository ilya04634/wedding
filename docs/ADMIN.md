# Admin Panel

Админ-панель доступна по адресу:

```text
/admin
```

## Переменная окружения

Добавьте в `.env.local` и Vercel:

```env
ADMIN_PASSWORD=ваш_пароль
```

## Что умеет MVP

- Вход по паролю.
- Редактирование текстов сайта через лист `Settings`.
- Включение/отключение ссылки на загрузку фото и видео.
- Просмотр приглашений из листа `Guests`, сгруппированных по `id`.
- Редактирование строк `Guests`:
  - `id`
  - `invite_name`
  - `person_name`
  - `person_type`
  - `child_age`
  - `bg_url`
  - `status`
- Очистка фона у всего приглашения.

## Как перегенерировать фон

1. Откройте `/admin`.
2. Нажмите `Очистить фон` у нужного приглашения.
3. Откройте Google Sheets.
4. Запустите `Wedding -> Generate all pending backgrounds`.

После этого Apps Script заново сгенерирует фон для приглашения, где `bg_url` и `status` пустые.

## Лист Settings

Админка сохраняет настройки в лист `Settings`.

Первая строка:

```text
key | value
```

Если листа `Settings` нет, сайт использует значения по умолчанию. При первом сохранении настроек из `/admin` приложение создаст лист `Settings` автоматически.

Настройка показа ссылки на загрузку медиа:

```text
uploadLinkEnabled | true
```

Чтобы скрыть ссылку:

```text
uploadLinkEnabled | false
```

## Invite background generation

Recommended MVP flow: generate invite backgrounds from `/admin`, not from Google
Sheets. This avoids repeated Google Apps Script authorization prompts.

In `/admin`, every invite card has:

- `Сгенерировать фон` - generates the AI background, uploads it to Drive, and
  writes `bg_url`, `invite_url`, and `status=done` to every row with this `id`.
- `Записать invite_url` - appears when `bg_url` is already ready and
  `status=done`; it only writes the public site link and does not spend OpenAI
  credits.
- `Очистить фон` - clears the background/status so the invite can be generated
  again.

Google Apps Script can remain as a fallback, but it is no longer the main path
for generation.

Each guest row can also have a `prompt` value. If it is empty, generation uses
the default prompt file. If it is filled, the custom prompt is added to the
default prompt as a small preference, not used as a full replacement.

Use `Заполнить пустые id` when helpers filled `invite_name` and guest names but
left `id` empty. Rows with the same `invite_name` receive the same generated id.

RSVP answers update existing rows by `Invite_Id + Person_Name`, so repeat
submissions do not create duplicates.
