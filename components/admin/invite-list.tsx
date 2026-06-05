"use client";

import {
  clearInviteBackgroundAction,
  generateInviteBackgroundAction,
  updateInviteTextAction,
  updateGuestPersonAction,
} from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GuestInvite } from "@/types/guest";
import Link from "next/link";
import { useMemo, useState } from "react";

interface AdminInviteListProps {
  invites: GuestInvite[];
}

function getSearchText(invite: GuestInvite) {
  return [
    invite.id,
    invite.inviteName,
    invite.status,
    invite.people.map((person) => person.personName).join(" "),
    invite.people.map((person) => person.adminLabel).join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function AdminInviteList({ invites }: AdminInviteListProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredInvites = useMemo(() => {
    if (!normalizedQuery) return invites;
    return invites.filter((invite) =>
      getSearchText(invite).includes(normalizedQuery),
    );
  }, [invites, normalizedQuery]);

  return (
    <section className="mt-8">
      <div className="mb-4 rounded-lg border border-neutral-200 bg-white p-4">
        <Label htmlFor="invite-search">Поиск по приглашениям</Label>
        <Input
          id="invite-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Имя семьи, гость, id или статус"
          className="mt-2"
        />
        <p className="mt-2 text-xs text-neutral-500">
          Найдено: {filteredInvites.length} из {invites.length}
        </p>
      </div>

      <div className="space-y-4">
        {filteredInvites.map((invite) => {
          const hasId = Boolean(invite.id);
          const inviteKey =
            invite.id ||
            `${invite.inviteName}-${invite.people.map((p) => p.sheetRow).join("-")}`;

          return (
            <details
              key={inviteKey}
              open={Boolean(normalizedQuery)}
              className="rounded-lg border border-neutral-200 bg-white"
            >
              <summary className="cursor-pointer list-none border-b border-neutral-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-neutral-900">
                      {invite.inviteName}
                    </h2>
                    <p className="text-sm text-neutral-500">
                      ID: {invite.id || "пусто"} · гостей: {invite.people.length} ·
                      статус: {invite.status || "пусто"}
                    </p>
                    {!hasId ? (
                      <p className="mt-1 text-xs text-amber-700">
                        Сначала нажмите &quot;Заполнить пустые id&quot;, чтобы можно было
                        генерировать ссылку.
                      </p>
                    ) : null}
                    {invite.bgUrl && hasId ? (
                      <Link
                        href={
                          invite.inviteUrl ||
                          `/i/${encodeURIComponent(invite.id)}`
                        }
                        className="mt-1 inline-block text-sm text-neutral-900 underline underline-offset-4"
                        target="_blank"
                      >
                        Открыть приглашение
                      </Link>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <form action={generateInviteBackgroundAction}>
                      <input type="hidden" name="id" value={invite.id} />
                      <Button type="submit" disabled={!hasId}>
                        {invite.bgUrl && invite.status === "done"
                          ? "Записать invite_url"
                          : "Сгенерировать фон"}
                      </Button>
                    </form>
                    <form action={clearInviteBackgroundAction}>
                      <input type="hidden" name="id" value={invite.id} />
                      <Button type="submit" variant="secondary" disabled={!hasId}>
                        Очистить фон
                      </Button>
                    </form>
                  </div>
                </div>
              </summary>

              <div className="divide-y divide-neutral-200">
                <form
                  action={updateInviteTextAction}
                  className="grid gap-3 p-4 sm:grid-cols-2"
                >
                  <input type="hidden" name="id" value={invite.id} />
                  <div className="sm:col-span-2">
                    <Label htmlFor={`inviteText-${inviteKey}`}>
                      Индивидуальный текст приглашения
                    </Label>
                    <textarea
                      id={`inviteText-${inviteKey}`}
                      name="inviteText"
                      defaultValue={invite.inviteText ?? ""}
                      placeholder="Если пусто, будет использован общий текст из настроек сайта"
                      className="min-h-24 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                      Сохраняется в колонку invite_text во все строки этого
                      приглашения.
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" disabled={!hasId}>
                      Сохранить текст приглашения
                    </Button>
                  </div>
                </form>

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
                    <input
                      type="hidden"
                      name="inviteText"
                      value={person.inviteText ?? invite.inviteText ?? ""}
                    />

                    <div>
                      <Label htmlFor={`id-${person.sheetRow}`}>id</Label>
                      <Input
                        id={`id-${person.sheetRow}`}
                        name="id"
                        defaultValue={person.id}
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
                      {person.adminLabel ? (
                        <p className="mt-1 text-xs text-neutral-500">
                          Для нас: {person.personName} {person.adminLabel}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <Label htmlFor={`adminLabel-${person.sheetRow}`}>
                        admin_label
                      </Label>
                      <Input
                        id={`adminLabel-${person.sheetRow}`}
                        name="adminLabel"
                        defaultValue={person.adminLabel ?? ""}
                        placeholder="Коваль, Дубай, работа"
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

                    <label className="flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm lg:col-span-2">
                      <input
                        type="checkbox"
                        name="noDeclension"
                        defaultChecked={person.noDeclension}
                        className="h-4 w-4 accent-neutral-900"
                      />
                      Не склонять имя в превью
                    </label>

                    <label className="flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm lg:col-span-2">
                      <input
                        type="checkbox"
                        name="informalTone"
                        defaultChecked={person.informalTone}
                        className="h-4 w-4 accent-neutral-900"
                      />
                      Обращаться на ты
                    </label>

                    <div className="sm:col-span-2 lg:col-span-8">
                      <Label htmlFor={`prompt-${person.sheetRow}`}>prompt</Label>
                      <textarea
                        id={`prompt-${person.sheetRow}`}
                        name="prompt"
                        defaultValue={person.prompt ?? invite.prompt ?? ""}
                        className="min-h-24 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-8">
                      <Label htmlFor={`inviteUrl-${person.sheetRow}`}>
                        invite_url
                      </Label>
                      <Input
                        id={`inviteUrl-${person.sheetRow}`}
                        name="inviteUrl"
                        defaultValue={person.inviteUrl ?? invite.inviteUrl ?? ""}
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-8">
                      <Button type="submit">Сохранить строку</Button>
                    </div>
                  </form>
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
