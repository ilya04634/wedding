import {
  clearInviteBackgroundAction,
  loginAdmin,
  logoutAdmin,
  updateGuestPersonAction,
} from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { listInvites } from "@/lib/google/guests";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface AdminPageProps {
  searchParams: { error?: string };
}

function LoginForm({ hasError }: { hasError: boolean }) {
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
        {hasError ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Неверный пароль администратора.
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
  if (!isAuthenticated) return <LoginForm hasError={searchParams.error === "1"} />;

  const invites = await listInvites();

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
          Чтобы перегенерировать фон: очистите фон у приглашения кнопкой
          &quot;Очистить фон&quot;, затем запустите в Google Sheets меню{" "}
          <span className="font-medium">Wedding - Generate all pending backgrounds</span>.
        </p>
      </section>

      <div className="mt-8 space-y-8">
        {invites.map((invite) => (
          <section
            key={invite.id}
            className="rounded-lg border border-neutral-200 bg-white"
          >
            <header className="flex flex-col gap-3 border-b border-neutral-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-medium text-neutral-900">
                  {invite.inviteName}
                </h2>
                <p className="text-sm text-neutral-500">
                  ID: {invite.id} · гостей: {invite.people.length} · статус:{" "}
                  {invite.status || "пусто"}
                </p>
                {invite.bgUrl ? (
                  <Link
                    href={`/i/${encodeURIComponent(invite.id)}`}
                    className="mt-1 inline-block text-sm text-neutral-900 underline underline-offset-4"
                    target="_blank"
                  >
                    Открыть приглашение
                  </Link>
                ) : null}
              </div>
              <form action={clearInviteBackgroundAction}>
                <input type="hidden" name="id" value={invite.id} />
                <Button type="submit" variant="secondary">
                  Очистить фон
                </Button>
              </form>
            </header>

            <div className="divide-y divide-neutral-200">
              {invite.people.map((person) => (
                <form
                  key={person.sheetRow}
                  action={updateGuestPersonAction}
                  className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-8"
                >
                  <input
                    type="hidden"
                    name="sheetRow"
                    value={person.sheetRow}
                  />

                  <div>
                    <Label htmlFor={`id-${person.sheetRow}`}>id</Label>
                    <Input
                      id={`id-${person.sheetRow}`}
                      name="id"
                      defaultValue={person.id}
                      required
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <Label htmlFor={`inviteName-${person.sheetRow}`}>
                      invite_name
                    </Label>
                    <Input
                      id={`inviteName-${person.sheetRow}`}
                      name="inviteName"
                      defaultValue={person.inviteName ?? invite.inviteName}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`personName-${person.sheetRow}`}>
                      person_name
                    </Label>
                    <Input
                      id={`personName-${person.sheetRow}`}
                      name="personName"
                      defaultValue={person.personName}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor={`personType-${person.sheetRow}`}>
                      person_type
                    </Label>
                    <select
                      id={`personType-${person.sheetRow}`}
                      name="personType"
                      defaultValue={person.personType}
                      className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="adult">adult</option>
                      <option value="child">child</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor={`childAge-${person.sheetRow}`}>
                      child_age
                    </Label>
                    <Input
                      id={`childAge-${person.sheetRow}`}
                      name="childAge"
                      defaultValue={person.childAge ?? ""}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`status-${person.sheetRow}`}>status</Label>
                    <Input
                      id={`status-${person.sheetRow}`}
                      name="status"
                      defaultValue={person.status ?? ""}
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-8">
                    <Label htmlFor={`bgUrl-${person.sheetRow}`}>bg_url</Label>
                    <Input
                      id={`bgUrl-${person.sheetRow}`}
                      name="bgUrl"
                      defaultValue={person.bgUrl ?? ""}
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-8">
                    <Button type="submit">Сохранить строку</Button>
                  </div>
                </form>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
