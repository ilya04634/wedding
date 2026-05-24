import { z } from "zod";

export const rsvpStatusSchema = z.enum(["confirmed", "maybe", "declined"]);

export const drinkPreferenceSchema = z.enum(["wine", "strong", "non_alcoholic"]);

export const childEntrySchema = z.object({
  name: z.string().trim().min(1, "Укажите имя ребёнка"),
  age: z.string().trim().min(1, "Укажите возраст"),
});

export const rsvpFormSchema = z
  .object({
    guestId: z.string().trim().optional(),
    name: z
      .string()
      .trim()
      .min(2, "Укажите имя и фамилию (минимум 2 символа)"),
    status: rsvpStatusSchema,
    withPartner: z.boolean(),
    partnerName: z.string().trim().optional(),
    withChildren: z.boolean(),
    children: z.array(childEntrySchema),
    drinks: z.array(drinkPreferenceSchema),
    allergies: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.withPartner &&
      data.status !== "declined" &&
      (!data.partnerName || data.partnerName.length < 2)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Укажите имя и фамилию партнёра",
        path: ["partnerName"],
      });
    }

    if (data.withChildren && data.status !== "declined") {
      if (data.children.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Добавьте хотя бы одного ребёнка",
          path: ["children"],
        });
      } else {
        data.children.forEach((_, index) => {
          const parsed = childEntrySchema.safeParse(data.children[index]);
          if (!parsed.success) {
            parsed.error.issues.forEach((issue) => {
              ctx.addIssue({
                ...issue,
                path: ["children", index, ...issue.path],
              });
            });
          }
        });
      }
    }

    if (data.status !== "declined" && data.drinks.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Выберите хотя бы один вариант напитка",
        path: ["drinks"],
      });
    }
  });

export type RsvpFormValues = z.infer<typeof rsvpFormSchema>;
