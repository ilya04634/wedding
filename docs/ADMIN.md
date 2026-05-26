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
