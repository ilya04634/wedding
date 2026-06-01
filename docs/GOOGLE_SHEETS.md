# Google Sheets Setup

## Лист `Guests`

Первая строка должна быть заголовками:

```text
id | invite_name | person_name | invite_text | person_type | child_age | prompt | no_declension | informal_tone | invite_url
```

Колонки:

| Колонка | Что писать |
| --- | --- |
| `id` | Общий alias приглашения. Одинаковый у всех людей из одной пары/семьи/группы. |
| `invite_name` | Обращение на приглашении: `Татьяна и Дмитрий`, `Иван и Мария с детьми`. Можно повторить во всех строках группы. |
| `person_name` | Имя конкретного человека для RSVP. |
| `person_type` | `adult` для взрослых, `child` для детей. |
| `child_age` | Возраст ребенка, можно оставить пустым. |
| `prompt` | Дополнение к промту генерации фона. Можно оставить пустым. |
| `invite_text` | Индивидуальный текст на персональном приглашении. Если пусто, используется общий текст из Settings. |
| `no_declension` | `TRUE`, если имя в превью ссылки не нужно склонять. |
| `informal_tone` | `TRUE`, если в приглашении нужно обращаться на `ты`, а не на `вы`. |
| `invite_url` | Публичная ссылка, которую можно отправить гостям. |

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

## Лист `Пожелания`

Стена пожеланий на главной странице читает и записывает данные в отдельный лист:

```text
Пожелания
```

Если листа нет, сайт создаст его автоматически при первом открытии блока или
при первом отправленном пожелании.

Первая строка:

```text
Timestamp | Guest Name | Wish Text
```

Каждое новое пожелание добавляется отдельной строкой. Название листа можно
переопределить в Vercel:

```text
WISHES_SHEET_NAME=Пожелания
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

## Лист `BackgroundPool`

Для экономии OpenAI-кредитов сайт может переиспользовать уже готовые фоны.
Если листа `BackgroundPool` нет, приложение создаст его автоматически при
первой генерации фона без индивидуального `prompt`.

Заголовки листа:

```text
bg_id | bg_url | style_key | used_count | max_uses | status | created_at | last_used_at | source_invite_id | notes
```

Как это работает:

1. Если в `Guests.prompt` что-то указано, фон всегда генерируется заново и не
   берется из пула.
2. Если `Guests.prompt` пустой, сайт сначала ищет активный фон в
   `BackgroundPool`, где `used_count < max_uses`.
3. Если такой фон найден, его `bg_url` записывается в приглашение, а
   `used_count` увеличивается на 1.
4. Если свободных фонов нет, сайт генерирует новый фон, записывает его в
   приглашение и добавляет в `BackgroundPool` с `used_count = 1`.

По умолчанию один фон используется максимум 4 раза. Это можно изменить в Vercel
через переменную:

```text
BACKGROUND_POOL_MAX_USES=4
```

Если какой-то фон не нравится, в листе `BackgroundPool` можно поставить:

```text
status | disabled
```

Тогда сайт больше не будет брать этот фон для новых приглашений.

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

Порядок блоков на главной странице управляется ключом:

```text
sectionOrder
```

Значение можно менять в `/admin`, по одному ключу на строку:

```text
countdown
program
dressCode
wishWall
rsvp
final
```

`hero` всегда остается первым экраном приглашения.

Включение и выключение блоков управляется ключом:

```text
enabledSections
```

В `/admin` это редактируется галочками. В самом листе значение хранится так же:
по одному ключу на строку. Чтобы скрыть блок на главной, удалите его ключ из
`enabledSections`. Чтобы вернуть блок, добавьте ключ обратно.

Стена пожеланий управляется ключами:

```text
wishWallLayout
wishWallDensity
wishWallMaxTilt
wishWallOverlap
```

`wishWallLayout` поддерживает варианты:

```text
masonry | staggered | garland | featured | ribbon | random
```

`wishWallDensity`: `airy`, `balanced`, `compact`.
`wishWallMaxTilt`: максимальный наклон карточек в градусах.
`wishWallOverlap`: допустимое мягкое наложение карточек в пикселях.

Анимации появления блоков управляются ключами:

```text
revealAnimationMode
revealAnimationSpeed
revealAnimationTrigger
revealAnimationDistance
```

`revealAnimationMode`: `repeat`, `once`, `off`.
`revealAnimationSpeed`: `fast`, `medium`, `smooth`.
`revealAnimationTrigger`: `early`, `medium`, `late`.
`revealAnimationDistance`: смещение появления в пикселях.

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

## Apps Script Web App mode

The menu can work through a deployed Apps Script Web App.

Current `WEB_APP_URL` in `scripts/google-apps-script-generate-bg.gs`:

```text
https://script.google.com/macros/s/AKfycbwU3iGa-i1A1lMyuQwL2AWpBy8OGKkAxVFQATUkNZ0wNvAot5lYLQB8cJDzC3pnJQMo/exec
```

After updating the script in Google Apps Script:

1. Deploy or redeploy it as Web App.
2. Keep "Execute as" set to your account.
3. Keep access set to users who should be able to run it.
4. Reload Google Sheets.
5. Use `Wedding -> Open generator panel`.

The panel opens Web App links for all pending invites or the selected invite.
The older direct menu items are still kept as a fallback.

Note: Google may still ask for authorization when using a custom Sheets menu,
because the menu itself runs inside Google Apps Script. The recommended MVP flow
is to run generation from `/admin` on the site and use Sheets only as data
storage.

## Per-invite prompt

The `Guests` sheet can include an optional `prompt` column:

```text
id | invite_name | person_name | invite_text | person_type | child_age | prompt | no_declension | informal_tone | invite_url
```

If `prompt` is empty, the invite background uses the default prompt from
`prompts/invite-background.txt`. If `prompt` is filled, it is used as an
addition to the default prompt, not as a replacement. Use it for small
preferences like colors, flowers, or mood accents. You can use `{{guestName}}`
inside it.

The optional `invite_text` column overrides the default invitation phrase for
one invite. If it is empty, the site uses `inviteBodyText` from Settings. In
`/admin`, the per-invite text editor saves this value to every row with the same
`id`.

Set `informal_tone` to `TRUE` for invites that should use informal wording:
`вас/вам/вы` becomes `тебя/тебе/ты` on the personal invite and personalized
main-page greeting.

In addition, the site automatically derives a stable visual variant from each
invite `id`: flower type, accent palette, composition, light, and texture. This
keeps the overall wedding style consistent while making backgrounds different
for different invites. The optional `prompt` column is applied after this
automatic variant, as an extra accent.

## Auto-fill invite ids

For easier data entry, helpers can fill only:

```text
invite_name | person_name | invite_text | person_type | child_age | prompt | no_declension | informal_tone
```

Then open `/admin` and click `Заполнить пустые id`. The site will generate ids
from `invite_name`. Rows with the same `invite_name` receive the same id.

## RSVP updates

RSVP rows are saved by key:

```text
Invite_Id + Person_Name
```

If a guest submits the form again, the existing row is updated instead of adding
a duplicate.
