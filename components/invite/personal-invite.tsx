import type { GuestInvite } from "@/types/guest";
import type { SiteSettings } from "@/types/settings";
import { ArrowRight, Calendar, MapPin, Users } from "lucide-react";
import Link from "next/link";

interface PersonalInviteProps {
  invite: GuestInvite;
  settings: SiteSettings;
}

function formatNames(names: string[]) {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} и ${names[1]}`;

  return `${names.slice(0, -1).join(", ")} и ${names[names.length - 1]}`;
}

function getChildrenLine(invite: GuestInvite) {
  const children = invite.people.filter((person) => person.personType === "child");
  if (!children.length) return null;

  return `Также будем очень рады видеть: ${formatNames(
    children.map((child) => child.personName),
  )}.`;
}

export function PersonalInvite({ invite, settings }: PersonalInviteProps) {
  const hasBackground = Boolean(invite.bgUrl);
  const childrenLine = getChildrenLine(invite);
  const detailsUrl = `/?guestId=${encodeURIComponent(invite.id)}`;
  const rsvpUrl = `${detailsUrl}#rsvp`;

  return (
    <main className="relative min-h-[100dvh] w-full overflow-hidden bg-neutral-950 text-white">
      {hasBackground ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${invite.bgUrl})` }}
          role="img"
          aria-label="Персональный фон приглашения"
        />
      ) : (
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#f5efe7,_#9a8f83_45%,_#2d2926)]"
          aria-hidden
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/70" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" aria-hidden />

      <section className="relative z-10 mx-auto flex min-h-[100dvh] max-w-4xl flex-col justify-between px-5 py-8 text-center sm:px-8 sm:py-10">
        <header className="flex items-center justify-center text-xs uppercase text-white/75 sm:justify-between">
          <span>{settings.weddingDate}</span>
          <span className="hidden sm:inline">{settings.coupleNames}</span>
        </header>

        <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center py-12">
          <p className="text-sm uppercase text-white/75">Приглашение</p>
          <h1 className="mt-5 text-balance text-4xl font-light leading-tight sm:text-6xl">
            {invite.inviteName}
          </h1>
          <p className="mt-6 max-w-xl text-balance text-xl font-light leading-8 text-white/95 sm:text-2xl">
            приглашаем вас разделить с нами день нашей свадьбы
          </p>

          {childrenLine ? (
            <p className="mt-5 max-w-lg text-balance text-base leading-7 text-white/85">
              {childrenLine}
            </p>
          ) : null}

          <div className="mt-9 grid w-full max-w-lg gap-3 text-sm text-white/90 sm:grid-cols-3">
            <p className="flex items-center justify-center gap-2 rounded-md border border-white/20 bg-black/20 px-3 py-3 backdrop-blur-sm">
              <Calendar className="h-4 w-4 shrink-0" aria-hidden />
              <span>{settings.weddingTime}</span>
            </p>
            <p className="flex items-center justify-center gap-2 rounded-md border border-white/20 bg-black/20 px-3 py-3 backdrop-blur-sm sm:col-span-2">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden />
              <span>{settings.weddingVenue}</span>
            </p>
          </div>

          <div className="mt-7 flex items-center justify-center gap-2 text-sm text-white/80">
            <Users className="h-4 w-4 shrink-0" aria-hidden />
            <span>{invite.people.length} приглашенных в этой ссылке</span>
          </div>
        </div>

        <footer className="mx-auto flex w-full max-w-lg flex-col gap-3 pb-2">
          <Link
            href={detailsUrl}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-neutral-950 transition-colors hover:bg-white/90"
          >
            Перейти к основной странице
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href={rsvpUrl}
            className="inline-flex items-center justify-center rounded-lg border border-white/35 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Перейти сразу к анкете
          </Link>
          {!hasBackground ? (
            <p className="pt-2 text-xs text-white/65">
              Персональный фон появится здесь после генерации.
            </p>
          ) : null}
        </footer>
      </section>
    </main>
  );
}
