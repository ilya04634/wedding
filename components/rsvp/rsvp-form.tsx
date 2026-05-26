"use client";

import { submitRsvp } from "@/actions/rsvp";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Section } from "@/components/ui/section";
import { Textarea } from "@/components/ui/textarea";
import { rsvpFormSchema, type RsvpFormValues } from "@/lib/validations/rsvp";
import { cn } from "@/lib/utils";
import type { GuestPerson } from "@/types/guest";
import type { RsvpFormData } from "@/types/rsvp";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

const STATUS_OPTIONS: {
  value: RsvpFormValues["people"][number]["status"];
  label: string;
}[] = [
  { value: "confirmed", label: "Буду" },
  { value: "maybe", label: "Пока не уверен(а)" },
  { value: "declined", label: "Не буду" },
];

const DRINK_OPTIONS: {
  value: NonNullable<RsvpFormValues["people"][number]["drink"]>;
  label: string;
}[] = [
  { value: "wine", label: "Вино" },
  { value: "champagne", label: "Шампанское" },
  { value: "strong", label: "Крепкое" },
  { value: "no_alcohol", label: "Не буду алкоголь" },
];

interface RsvpFormProps {
  guestId?: string;
  initialName?: string;
  people?: GuestPerson[];
  description: string;
}

function getDefaultPeople(
  people: GuestPerson[] | undefined,
  initialName: string | undefined,
): RsvpFormValues["people"] {
  if (people?.length) {
    return people.map((person) => ({
      personName: person.personName,
      personType: person.personType,
      status: "confirmed",
      drink: person.personType === "child" ? "not_applicable" : undefined,
      allergens: "",
    }));
  }

  return [
    {
      personName: initialName ?? "",
      personType: "adult",
      status: "confirmed",
      drink: undefined,
      allergens: "",
    },
  ];
}

export function RsvpForm({
  guestId,
  initialName,
  people,
  description,
}: RsvpFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpFormSchema),
    defaultValues: {
      guestId: guestId ?? "",
      people: getDefaultPeople(people, initialName),
    },
  });

  const formPeople = watch("people");

  const onSubmit = async (data: RsvpFormValues) => {
    setSubmitError(null);
    const normalized: RsvpFormData = {
      guestId: data.guestId?.trim() || guestId,
      people: data.people.map((person) => ({
        ...person,
        drink:
          person.personType === "child" || person.status === "declined"
            ? "not_applicable"
            : person.drink ?? "no_alcohol",
        allergens: person.allergens?.trim() || undefined,
      })),
    };

    const result = await submitRsvp(normalized);

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Section
        id="rsvp"
        title="Спасибо!"
        description="Ваш ответ сохранен. До встречи на празднике!"
      >
        <div className="flex flex-col items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 py-10 text-center">
          <CheckCircle2 className="h-10 w-10 text-neutral-700" aria-hidden />
          <p className="text-sm text-neutral-600">
            Мы получили анкету по каждому гостю из приглашения.
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setSubmitted(false)}
          >
            Изменить ответ
          </Button>
        </div>
      </Section>
    );
  }

  return (
    <Section
      id="rsvp"
      title="Подтверждение присутствия"
      description={description}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-xl border border-neutral-200 bg-neutral-50/50 p-6 sm:p-8"
        noValidate
      >
        <input type="hidden" {...register("guestId")} />
        {guestId ? (
          <p className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-600">
            Персональная ссылка · ID: {guestId}
          </p>
        ) : null}

        <div className="space-y-5">
          {formPeople.map((person, index) => {
            const isChild = person.personType === "child";
            const isDeclined = person.status === "declined";

            return (
              <section
                key={`${person.personName}-${index}`}
                className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4"
              >
                <input
                  type="hidden"
                  {...register(`people.${index}.personName`)}
                />
                <input
                  type="hidden"
                  {...register(`people.${index}.personType`)}
                />

                <div>
                  <p className="text-base font-medium text-neutral-900">
                    {person.personName}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {isChild ? "Ребенок" : "Взрослый гость"}
                  </p>
                </div>

                <fieldset>
                  <legend className="mb-2 text-sm font-medium text-neutral-800">
                    Присутствие
                  </legend>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {STATUS_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                          "has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-50",
                          "border-neutral-300 bg-white hover:border-neutral-400",
                        )}
                      >
                        <input
                          type="radio"
                          value={opt.value}
                          className="h-4 w-4 accent-neutral-900"
                          {...register(`people.${index}.status`)}
                          onChange={(event) => {
                            setValue(
                              `people.${index}.status`,
                              event.target.value as typeof opt.value,
                              { shouldValidate: true },
                            );
                            if (event.target.value === "declined" || isChild) {
                              setValue(`people.${index}.drink`, "not_applicable", {
                                shouldValidate: true,
                              });
                            }
                          }}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                  {errors.people?.[index]?.status ? (
                    <p className="mt-1.5 text-sm text-red-600" role="alert">
                      {errors.people[index]?.status?.message}
                    </p>
                  ) : null}
                </fieldset>

                {!isChild && !isDeclined ? (
                  <fieldset>
                    <legend className="mb-2 text-sm font-medium text-neutral-800">
                      Алкоголь
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {DRINK_OPTIONS.map((opt) => (
                        <label
                          key={opt.value}
                          className={cn(
                            "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                            "has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-50",
                            "border-neutral-300 bg-white hover:border-neutral-400",
                          )}
                        >
                          <input
                            type="radio"
                            value={opt.value}
                            className="h-4 w-4 accent-neutral-900"
                            {...register(`people.${index}.drink`)}
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                    {errors.people?.[index]?.drink ? (
                      <p className="mt-1.5 text-sm text-red-600" role="alert">
                        {errors.people[index]?.drink?.message}
                      </p>
                    ) : null}
                  </fieldset>
                ) : null}

                <div>
                  <Label htmlFor={`allergens-${index}`}>
                    Аллергены{" "}
                    <span className="font-normal text-neutral-500">
                      (если есть)
                    </span>
                  </Label>
                  <Textarea
                    id={`allergens-${index}`}
                    placeholder="Например: орехи, мед, рыба"
                    {...register(`people.${index}.allergens`)}
                  />
                </div>
              </section>
            );
          })}
        </div>

        {submitError ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {submitError}
          </p>
        ) : null}

        <Button
          type="submit"
          className="w-full bg-[#e79796] text-white shadow-[0_14px_30px_rgba(231,151,150,0.28)] hover:bg-[#d98584] sm:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Отправка..." : "Отправить ответ"}
        </Button>
      </form>
    </Section>
  );
}
