import {
  fillMissingGuestIdsAction,
  loginAdmin,
  logoutAdmin,
  updateSiteSettingsAction,
} from "@/actions/admin";
import { AdminInviteList } from "@/components/admin/invite-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  isAdminAuthenticated,
  isAdminPasswordConfigured,
} from "@/lib/admin/auth";
import { listInvites } from "@/lib/google/guests";
import { getSiteSettings, settingsToFormData } from "@/lib/google/settings";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

interface AdminPageProps {
  searchParams: { error?: string };
}

function LoginForm({
  error,
  isPasswordConfigured,
}: {
  error?: string;
  isPasswordConfigured: boolean;
}) {
  const errorText =
    error === "not-configured" || !isPasswordConfigured
      ? "В Vercel не настроена переменная ADMIN_PASSWORD для этого окружения."
      : error === "invalid"
        ? "Неверный пароль администратора."
        : "";

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-sm flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold text-neutral-900">Админ-панель</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Введите пароль администратора, чтобы открыть управление приглашениями.
      </p>
      <form action={loginAdmin} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="password">Пароль</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        {errorText ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorText}
          </p>
        ) : null}
        <Button type="submit" className="w-full">
          Войти
        </Button>
      </form>
    </main>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const isAuthenticated = isAdminAuthenticated();
  const isPasswordConfigured = isAdminPasswordConfigured();
  if (!isAuthenticated) {
    return (
      <LoginForm
        error={searchParams.error}
        isPasswordConfigured={isPasswordConfigured}
      />
    );
  }

  const [invites, settings] = await Promise.all([
    listInvites(),
    getSiteSettings(),
  ]);
  const settingsForm = settingsToFormData(settings);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="flex flex-col gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">
            Админ-панель
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            MVP-управление строками листа Guests. Изменения сразу сохраняются в
            Google Sheets.
          </p>
        </div>
        <form action={logoutAdmin}>
          <Button type="submit" variant="secondary">
            Выйти
          </Button>
        </form>
      </header>

      <section className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
        <p>
          Генерацию лучше запускать здесь, в админке сайта. Google Sheets остается
          таблицей данных, а сайт сам запишет `bg_url`, `invite_url` и `status`.
          Если фон уже готов, кнопка генерации только дозапишет `invite_url` и не
          потратит OpenAI-кредиты.
        </p>
        <form action={fillMissingGuestIdsAction} className="mt-4">
          <Button type="submit" variant="secondary">
            Заполнить пустые id
          </Button>
        </form>
      </section>

      <section className="mt-8 rounded-lg border border-neutral-200 bg-white">
        <header className="border-b border-neutral-200 p-4">
          <h2 className="text-lg font-medium text-neutral-900">
            Тексты и настройки сайта
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Эти поля сохраняются в лист Settings. Для программы дня используйте
            JSON-массив.
          </p>
        </header>
        <form action={updateSiteSettingsAction} className="grid gap-4 p-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="coupleNames">Имена пары</Label>
            <Input id="coupleNames" name="coupleNames" defaultValue={settingsForm.coupleNames} />
          </div>
          <div>
            <Label htmlFor="siteTitle">Заголовок сайта</Label>
            <Input id="siteTitle" name="siteTitle" defaultValue={settingsForm.siteTitle} />
          </div>
          <div>
            <Label htmlFor="navTitle">Текст в шапке</Label>
            <Input id="navTitle" name="navTitle" defaultValue={settingsForm.navTitle} />
          </div>
          <div>
            <Label htmlFor="uploadLinkLabel">Текст ссылки загрузки</Label>
            <Input id="uploadLinkLabel" name="uploadLinkLabel" defaultValue={settingsForm.uploadLinkLabel} />
          </div>
          <label className="flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              name="uploadLinkEnabled"
              defaultChecked={settings.uploadLinkEnabled}
              className="h-4 w-4 accent-neutral-900"
            />
            Показывать ссылку на загрузку фото и видео
          </label>
          <div>
            <Label htmlFor="heroDefaultEyebrow">Верхний текст hero</Label>
            <Input id="heroDefaultEyebrow" name="heroDefaultEyebrow" defaultValue={settingsForm.heroDefaultEyebrow} />
          </div>
          <div>
            <Label htmlFor="heroPersonalEyebrowTemplate">Hero для гостя</Label>
            <Input id="heroPersonalEyebrowTemplate" name="heroPersonalEyebrowTemplate" defaultValue={settingsForm.heroPersonalEyebrowTemplate} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="heroText">Основной текст hero</Label>
            <textarea
              id="heroText"
              name="heroText"
              defaultValue={settingsForm.heroText}
              className="min-h-20 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="weddingDate">Дата</Label>
            <Input id="weddingDate" name="weddingDate" defaultValue={settingsForm.weddingDate} />
          </div>
          <div>
            <Label htmlFor="weddingTime">Время</Label>
            <Input id="weddingTime" name="weddingTime" defaultValue={settingsForm.weddingTime} />
          </div>
          <div>
            <Label htmlFor="weddingVenue">Место</Label>
            <Input id="weddingVenue" name="weddingVenue" defaultValue={settingsForm.weddingVenue} />
          </div>
          <div>
            <Label htmlFor="weddingMapUrl">Ссылка 2ГИС</Label>
            <Input id="weddingMapUrl" name="weddingMapUrl" defaultValue={settingsForm.weddingMapUrl} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="weddingAddressLine">Адрес</Label>
            <Input id="weddingAddressLine" name="weddingAddressLine" defaultValue={settingsForm.weddingAddressLine} />
          </div>
          <div>
            <Label htmlFor="programTitle">Заголовок программы</Label>
            <Input id="programTitle" name="programTitle" defaultValue={settingsForm.programTitle} />
          </div>
          <div>
            <Label htmlFor="footerText">Текст footer</Label>
            <Input id="footerText" name="footerText" defaultValue={settingsForm.footerText} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="programDescription">Описание программы</Label>
            <textarea
              id="programDescription"
              name="programDescription"
              defaultValue={settingsForm.programDescription}
              className="min-h-20 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="programItemsJson">Программа дня JSON</Label>
            <textarea
              id="programItemsJson"
              name="programItemsJson"
              defaultValue={settingsForm.programItemsJson}
              className="min-h-52 w-full rounded-md border border-neutral-300 px-3 py-2 font-mono text-xs"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="rsvpDescription">Описание анкеты</Label>
            <textarea
              id="rsvpDescription"
              name="rsvpDescription"
              defaultValue={settingsForm.rsvpDescription}
              className="min-h-20 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit">Сохранить настройки сайта</Button>
          </div>
        </form>
      </section>

      <AdminInviteList invites={invites} />
    </main>
  );
}
