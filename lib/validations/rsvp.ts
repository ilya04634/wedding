import { z } from "zod";

export const rsvpStatusSchema = z.enum(["confirmed", "maybe", "declined"]);

export const drinkPreferenceSchema = z.enum([
  "wine",
  "champagne",
  "strong",
  "no_alcohol",
]);

export const rsvpPersonSchema = z
  .object({
    personName: z.string().trim().min(1, "Укажите имя гостя"),
    personType: z.enum(["adult", "child"]),
    status: rsvpStatusSchema,
    drink: z
      .union([drinkPreferenceSchema, z.literal("not_applicable")])
      .optional(),
    allergens: z.string().trim().optional(),
  })
  .superRefine((person, ctx) => {
    if (
      person.personType === "adult" &&
      person.status !== "declined" &&
      !person.drink
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Выберите вариант по алкоголю",
        path: ["drink"],
      });
    }
  });

export const rsvpFormSchema = z.object({
  guestId: z.string().trim().optional(),
  people: z.array(rsvpPersonSchema).min(1, "Нет гостей для ответа"),
});

export type RsvpFormValues = z.infer<typeof rsvpFormSchema>;
