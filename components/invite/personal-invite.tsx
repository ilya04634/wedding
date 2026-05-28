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

function getChildrenLine(invite: GuestInvite, settings: SiteSettings) {
  const children = invite.people.filter((person) => person.personType === "child");
  if (!children.length) return null;

  return `${settings.inviteChildrenPrefix} ${formatNames(
    children.map((child) => child.personName),
  )}.`;
}

function formatCountTemplate(template: string, count: number) {
  return template.replaceAll("{{count}}", String(count));
}

export function PersonalInvite({ invite, settings }: PersonalInviteProps) {
  const hasBackground = Boolean(invite.bgUrl);
  const childrenLine = getChildrenLine(invite, settings);
  const backgroundUrl = `/api/invite-bg/${encodeURIComponent(invite.id)}`;
  const detailsUrl = `/?guestId=${encodeURIComponent(invite.id)}`;
  const rsvpUrl = `${detailsUrl}#rsvp`;

  return (
    <main className="relative min-h-[100dvh] w-full overflow-hidden bg-[#fbf3d9] text-[#4f5609]">
      {hasBackground ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
          style={{ backgroundImage: `url(${backgroundUrl})` }}
          role="img"
          aria-label="Персональный фон приглашения"
        />
      ) : (
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#fff8ea,_#fbf3d9_55%,_#e6ddcf)]"
          aria-hidden
        />
      )}

      <div className="absolute inset-0 bg-[#fbf3d9]/38" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-[44%] bg-gradient-to-t from-[#fbf3d9] via-[#fbf3d9]/92 to-transparent" aria-hidden />

      <section className="relative z-10 mx-auto flex min-h-[100dvh] max-w-3xl flex-col justify-between px-4 py-6 text-center sm:px-8 sm:py-10">
        <header className="flex items-center justify-center text-[0.68rem] uppercase tracking-[0.2em] text-[#4f5609]/70 sm:justify-between sm:text-xs">
          <span>{settings.weddingDate}</span>
          <span className="hidden sm:inline">{settings.coupleNames}</span>
        </header>

        <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center py-8 sm:py-12">
          <p className="font-display text-xs uppercase tracking-[0.24em] text-[#4f5609]/75 sm:text-sm">
            {settings.inviteLabel}
          </p>
          <h1 className="font-script mt-4 text-balance text-6xl leading-[0.82] text-[#4f5609] sm:mt-5 sm:text-8xl">
            {invite.inviteName}
          </h1>
          <p className="mt-6 max-w-md text-balance font-display text-xl uppercase leading-7 tracking-[0.04em] text-[#4f5609] sm:text-2xl">
            {settings.inviteBodyText}
          </p>

          {childrenLine ? (
            <p className="mt-4 max-w-lg text-balance text-sm leading-6 text-[#4f5609]/75 sm:mt-5 sm:text-base sm:leading-7">
              {childrenLine}
            </p>
          ) : null}

          <div className="mt-8 grid w-full max-w-lg gap-2 text-sm text-[#4f5609] sm:mt-10 sm:grid-cols-3 sm:gap-3">
            <p className="flex min-h-12 items-center justify-center gap-2 border-y border-[#4f5609]/30 px-3 py-3">
              <Calendar className="h-4 w-4 shrink-0 text-[#6c7411]" aria-hidden />
              <span>{settings.weddingTime}</span>
            </p>
            <p className="flex min-h-12 items-center justify-center gap-2 border-y border-[#4f5609]/30 px-3 py-3 sm:col-span-2">
              <MapPin className="h-4 w-4 shrink-0 text-[#6c7411]" aria-hidden />
              <span>{settings.weddingVenue}</span>
            </p>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs leading-5 text-[#4f5609]/70 sm:mt-7 sm:text-sm">
            <Users className="h-4 w-4 shrink-0" aria-hidden />
            <span>
              {formatCountTemplate(
                settings.inviteGuestCountTemplate,
                invite.people.length,
              )}
            </span>
          </div>
        </div>

        <footer className="mx-auto flex w-full max-w-lg flex-col gap-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:gap-3 sm:pb-2">
          <Link
            href={detailsUrl}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#4f5609] px-5 py-3 text-sm font-semibold text-[#fbf3d9] shadow-[0_16px_35px_rgba(17,16,14,0.18)] transition-colors hover:bg-[#4f5609] sm:px-6"
          >
            {settings.invitePrimaryButtonLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href={rsvpUrl}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#4f5609]/35 bg-[#fbf3d9]/75 px-5 py-3 text-sm font-semibold text-[#4f5609] backdrop-blur-sm transition-colors hover:bg-white/80 sm:px-6"
          >
            {settings.inviteRsvpButtonLabel}
          </Link>
          {!hasBackground ? (
            <p className="pt-2 text-xs text-[#4f5609]/60">
              {settings.inviteMissingBackgroundText}
            </p>
          ) : null}
        </footer>
      </section>
    </main>
  );
}

