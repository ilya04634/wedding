import { z } from "zod";

export const rsvpStatusSchema = z.enum(["confirmed", "maybe", "declined"]);

export const drinkPreferenceSchema = z.enum([
  "wine",
  "champagne",
  "strong",
  "no_alcohol",
]);

export const drinkAnswerSchema = z.union([
  z.string().trim(),
  z.array(z.string().trim()).default([]),
]);

export const rsvpPersonSchema = z.object({
  personName: z.string().trim().min(1, "Укажите имя гостя"),
  personType: z.enum(["adult", "child"]),
  status: rsvpStatusSchema,
  drink: drinkAnswerSchema.optional(),
  allergens: z.string().trim().optional(),
});

export const rsvpFormSchema = z.object({
  guestId: z.string().trim().optional(),
  people: z.array(rsvpPersonSchema).min(1, "Нет гостей для ответа"),
});

export type RsvpFormValues = z.infer<typeof rsvpFormSchema>;
