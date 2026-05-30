"use client";

import { submitRsvp } from "@/actions/rsvp";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
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

interface RsvpFormProps {
  guestId?: string;
  initialName?: string;
  people?: GuestPerson[];
  description: string;
  alcoholEnabled: boolean;
  alcoholOptions: string[];
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
      drink: person.personType === "child" ? "not_applicable" : [],
    }));
  }

  return [
    {
      personName: initialName ?? "",
      personType: "adult",
      status: "confirmed",
      drink: [],
    },
  ];
}

export function RsvpForm({
  guestId,
  initialName,
  people,
  description,
  alcoholEnabled,
  alcoholOptions,
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
    if (alcoholEnabled) {
      const missingAlcoholPerson = data.people.find((person) => {
        if (person.personType === "child" || person.status === "declined") {
          return false;
        }

        return !Array.isArray(person.drink) || person.drink.length === 0;
      });

      if (missingAlcoholPerson) {
        setSubmitError(
          `Выберите хотя бы один вариант алкоголя для ${missingAlcoholPerson.personName}.`,
        );
        return;
      }
    }

    const normalized: RsvpFormData = {
      guestId: data.guestId?.trim() || guestId,
      people: data.people.map((person) => ({
        ...person,
        drink:
          !alcoholEnabled ||
          person.personType === "child" ||
          person.status === "declined"
            ? "not_applicable"
            : Array.isArray(person.drink)
              ? person.drink
              : person.drink
                ? [person.drink]
                : [],
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
            className="w-full sm:w-auto"
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
        className="space-y-5 rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 sm:space-y-6 sm:p-8"
        noValidate
      >
        <input type="hidden" {...register("guestId")} />

        <div className="space-y-5">
          {formPeople.map((person, index) => {
            const isChild = person.personType === "child";
            const isDeclined = person.status === "declined";

            return (
              <section
                key={`${person.personName}-${index}`}
                className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4"
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
                  <p className="break-words text-base font-medium text-neutral-900">
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
                          "flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border px-3 py-3 text-sm transition-colors sm:py-2.5",
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
                            } else if (alcoholEnabled) {
                              setValue(`people.${index}.drink`, [], {
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

                {alcoholEnabled && !isChild && !isDeclined ? (
                  <fieldset>
                    <legend className="mb-2 text-sm font-medium text-neutral-800">
                      Алкоголь
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {alcoholOptions.map((option) => (
                        <label
                          key={option}
                          className={cn(
                            "flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border px-3 py-3 text-sm transition-colors sm:py-2.5",
                            "has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-50",
                            "border-neutral-300 bg-white hover:border-neutral-400",
                          )}
                        >
                          <input
                            type="checkbox"
                            value={option}
                            className="h-4 w-4 accent-neutral-900"
                            {...register(`people.${index}.drink`)}
                          />
                          {option}
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
