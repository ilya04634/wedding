"use server";

import { appendRsvpRow } from "@/lib/google/sheets";
import { rsvpFormSchema } from "@/lib/validations/rsvp";
import type { RsvpFormData } from "@/types/rsvp";

export type SubmitRsvpResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitRsvp(
  data: RsvpFormData,
): Promise<SubmitRsvpResult> {
  const parsed = rsvpFormSchema.safeParse(data);

  if (!parsed.success) {
    return {
      ok: false,
      error: "Проверьте правильность заполнения формы.",
    };
  }

  try {
    await appendRsvpRow(parsed.data);
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
