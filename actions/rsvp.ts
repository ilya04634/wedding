"use server";

import { upsertRsvpRows } from "@/lib/google/sheets";
import { rsvpFormSchema } from "@/lib/validations/rsvp";
import type { RsvpFormData } from "@/types/rsvp";

export type SubmitRsvpResult =
  | { ok: true }
  | { ok: false; error: string };

function normalizeDrinkAnswer(
  drink: RsvpFormData["people"][number]["drink"] | undefined,
) {
  if (Array.isArray(drink)) {
    return drink.map((item) => item.trim()).filter(Boolean).join(", ");
  }

  return drink?.trim() || "Не указано";
}

export async function submitRsvp(
  data: RsvpFormData,
): Promise<SubmitRsvpResult> {
  const parsed = rsvpFormSchema.safeParse(data);

  if (!parsed.success) {
    return {
      ok: false,
      error: "Проверьте правильность заполнения анкеты.",
    };
  }

  try {
    await upsertRsvpRows({
      guestId: parsed.data.guestId,
      people: parsed.data.people.map((person) => ({
        ...person,
        drink:
          person.personType === "child" || person.status === "declined"
            ? "not_applicable"
            : normalizeDrinkAnswer(person.drink),
      })),
    });
    return { ok: true };
  } catch (error) {
    console.error("[submitRsvp]", error);
    return {
      ok: false,
      error:
        "Не удалось сохранить ответ. Попробуйте позже или свяжитесь с нами напрямую.",
    };
  }
}
