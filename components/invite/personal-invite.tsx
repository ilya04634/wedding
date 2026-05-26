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
  const backgroundUrl = `/api/invite-bg/${encodeURIComponent(invite.id)}`;
  const detailsUrl = `/?guestId=${encodeURIComponent(invite.id)}`;
  const rsvpUrl = `${detailsUrl}#rsvp`;

  return (
    <main className="relative min-h-[100dvh] w-full overflow-hidden bg-neutral-950 text-white">
      {hasBackground ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundUrl})` }}
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

      <section className="relative z-10 mx-auto flex min-h-[100dvh] max-w-4xl flex-col justify-between px-4 py-6 text-center sm:px-8 sm:py-10">
        <header className="flex items-center justify-center text-[0.68rem] uppercase tracking-[0.16em] text-white/75 sm:justify-between sm:text-xs">
          <span>{settings.weddingDate}</span>
          <span className="hidden sm:inline">{settings.coupleNames}</span>
        </header>

        <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center py-8 sm:py-12">
          <p className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm sm:text-sm sm:tracking-[0.22em]">Приглашение</p>
          <h1 className="font-display mt-4 text-balance text-3xl leading-tight sm:mt-5 sm:text-6xl">
            {invite.inviteName}
          </h1>
          <p className="mt-5 max-w-xl text-balance text-lg font-light leading-7 text-white/95 sm:mt-6 sm:text-2xl sm:leading-8">
            приглашаем вас разделить с нами день нашей свадьбы
          </p>

          {childrenLine ? (
            <p className="mt-4 max-w-lg text-balance text-sm leading-6 text-white/85 sm:mt-5 sm:text-base sm:leading-7">
              {childrenLine}
            </p>
          ) : null}

          <div className="mt-7 grid w-full max-w-lg gap-2 text-sm text-white/90 sm:mt-9 sm:grid-cols-3 sm:gap-3">
            <p className="flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/20 bg-black/20 px-3 py-3 backdrop-blur-sm">
              <Calendar className="h-4 w-4 shrink-0" aria-hidden />
              <span>{settings.weddingTime}</span>
            </p>
            <p className="flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/20 bg-black/20 px-3 py-3 backdrop-blur-sm sm:col-span-2">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden />
              <span>{settings.weddingVenue}</span>
            </p>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs leading-5 text-white/80 sm:mt-7 sm:text-sm">
            <Users className="h-4 w-4 shrink-0" aria-hidden />
            <span>{invite.people.length} приглашенных в этой ссылке</span>
          </div>
        </div>

        <footer className="mx-auto flex w-full max-w-lg flex-col gap-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:gap-3 sm:pb-2">
          <Link
            href={detailsUrl}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#fdfbf7] px-5 py-3 text-sm font-semibold text-[#34312d] shadow-[0_16px_35px_rgba(253,251,247,0.22)] transition-colors hover:bg-white sm:px-6"
          >
            Перейти к основной странице
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href={rsvpUrl}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/35 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15 sm:px-6"
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
