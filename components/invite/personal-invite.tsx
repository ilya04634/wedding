import { COUPLE_NAMES } from "@/lib/constants/wedding";
import type { GuestInvite } from "@/types/guest";
import Link from "next/link";

interface PersonalInviteProps {
  invite: GuestInvite;
}

function getChildrenLine(invite: GuestInvite) {
  const children = invite.people.filter((person) => person.personType === "child");
  if (!children.length) return null;

  const names = children.map((child) => child.personName).join(", ");
  return `И, конечно, будем рады видеть ${names}.`;
}

export function PersonalInvite({ invite }: PersonalInviteProps) {
  const hasBackground = Boolean(invite.bgUrl);
  const childrenLine = getChildrenLine(invite);

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden">
      {hasBackground ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${invite.bgUrl})` }}
          role="img"
          aria-label="Фон приглашения"
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-neutral-200 via-stone-100 to-neutral-300"
          aria-hidden
        />
      )}

      <div className="absolute inset-0 bg-black/35" aria-hidden />

      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6 py-16 text-center text-white">
        <p className="mb-4 text-sm uppercase tracking-[0.25em] text-white/80">
          Приглашение
        </p>
        <p className="text-balance text-3xl font-light leading-snug sm:text-4xl">
          {invite.inviteName},
          <br />
          приглашаем вас на нашу свадьбу!
        </p>
        {childrenLine ? (
          <p className="mt-5 max-w-md text-balance text-base text-white/85">
            {childrenLine}
          </p>
        ) : null}
        <p className="mt-6 text-lg text-white/90">{COUPLE_NAMES}</p>

        <Link
          href={`/?guestId=${encodeURIComponent(invite.id)}`}
          className="mt-12 rounded-lg bg-white px-8 py-3 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
        >
          Перейти к деталям
        </Link>

        {!hasBackground ? (
          <p className="mt-8 max-w-xs text-xs text-white/70">
            Персональный фон появится после генерации.
          </p>
        ) : null}
      </div>
    </div>
  );
}
