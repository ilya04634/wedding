# Google Sheets Setup

## Лист `Guests`

Первая строка должна быть заголовками:

```text
id | invite_name | person_name | person_type | child_age | bg_url | invite_url | status
```

Колонки:

| Колонка | Что писать |
| --- | --- |
| `id` | Общий alias приглашения. Одинаковый у всех людей из одной пары/семьи/группы. |
| `invite_name` | Обращение на приглашении: `Татьяна и Дмитрий`, `Иван и Мария с детьми`. Можно повторить во всех строках группы. |
| `person_name` | Имя конкретного человека для RSVP. |
| `person_type` | `adult` для взрослых, `child` для детей. |
| `child_age` | Возраст ребенка, можно оставить пустым. |
| `bg_url` | Оставить пустым. Заполнится после генерации. |
| `status` | Оставить пустым. Заполнится `pending`, `done` или `error`. |

Пример пары:

```text
tatiana-dmitry | Татьяна и Дмитрий | Татьяна | adult |  |  |
tatiana-dmitry | Татьяна и Дмитрий | Дмитрий | adult |  |  |
```

Пример семьи:

```text
ivan-family | Иван и Мария с детьми | Иван | adult |  |  |
ivan-family | Иван и Мария с детьми | Мария | adult |  |  |
ivan-family | Иван и Мария с детьми | Алиса | child | 7 |  |
```

Ссылка для гостей:

```text
https://ваш-домен.vercel.app/i/ivan-family
```

## Лист `RSVP`

Первая строка должна быть заголовками:

```text
Timestamp | Invite_Id | Person_Name | Person_Type | Will_Attend | Alcohol_Pref | Allergens
```

Сайт сам добавляет строки. Один человек = одна строка.

Пример результата:

```text
2026-05-26T... | ivan-family | Иван | Взрослый | Буду | Вино | орехи
2026-05-26T... | ivan-family | Мария | Взрослый | Буду | Шампанское |
2026-05-26T... | ivan-family | Алиса | Ребенок | Буду | Не применимо | мед
```

## Массовая генерация AI-фонов

Вставьте код из:

```text
scripts/google-apps-script-generate-bg.gs
```

в Google Sheets -> Extensions -> Apps Script.

В скрипте замените:

```javascript
const WEBHOOK_URL = "https://YOUR_DOMAIN.vercel.app/api/generate-invite-bg";
const WEBHOOK_SECRET = "YOUR_WEBHOOK_SECRET";
```

После сохранения перезагрузите Google Sheet. Появится меню:

```text
Wedding -> Generate all pending backgrounds
```

Эта команда:

1. Смотрит лист `Guests`.
2. Собирает уникальные `id`, где `bg_url` пустой, а `status` не `pending` и не `done`.
3. По очереди вызывает webhook для каждого `id`.
4. Webhook генерирует один фон и записывает `bg_url/status` во все строки этого `id`.

Для теста сначала сделайте 2-3 приглашения, запустите генерацию, проверьте `bg_url`, затем запускайте на полном списке.

## Лист `Settings`

Для редактирования текстов сайта через `/admin` используется лист:

```text
Settings
```

Первая строка:

```text
key | value
```

Если листа нет, при первом сохранении настроек в `/admin` приложение создаст его и заполнит ключами автоматически.

Важный ключ для загрузки фото/видео:

```text
uploadLinkEnabled | false
```

Когда придет день праздника, в админке можно включить чекбокс показа ссылки на загрузку медиа, и значение станет:

```text
uploadLinkEnabled | true
```

## Invite links

`bg_url` is only the technical Google Drive image URL for the generated
background. Do not send it to guests.

`invite_url` is the public website URL for the finished invite, for example:

```text
https://your-domain.vercel.app/i/ivan-family
```

Send `invite_url` to guests. The site opens this page, reads the same `id`,
uses `bg_url` as the background, and then passes the guest data into the RSVP
form.
