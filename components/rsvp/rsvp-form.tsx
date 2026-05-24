"use client";

import { submitRsvp } from "@/actions/rsvp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Section } from "@/components/ui/section";
import { ChildrenFields } from "@/components/rsvp/children-fields";
import { RSVP_SECTION_DESCRIPTION } from "@/lib/constants/wedding";
import { rsvpFormSchema, type RsvpFormValues } from "@/lib/validations/rsvp";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

const STATUS_OPTIONS: {
  value: RsvpFormValues["status"];
  label: string;
}[] = [
  { value: "confirmed", label: "Точно буду" },
  { value: "maybe", label: "Пока не уверен(а)" },
  { value: "declined", label: "Не смогу" },
];

const DRINK_OPTIONS: {
  value: RsvpFormValues["drinks"][number];
  label: string;
}[] = [
  { value: "wine", label: "Вино" },
  { value: "strong", label: "Крепкое" },
  { value: "non_alcoholic", label: "Безалкогольное" },
];

interface RsvpFormProps {
  guestId?: string;
  initialName?: string;
}

export function RsvpForm({ guestId, initialName }: RsvpFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastStatus, setLastStatus] = useState<RsvpFormValues["status"]>("confirmed");

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpFormSchema),
    defaultValues: {
      guestId: guestId ?? "",
      name: initialName ?? "",
      status: "confirmed",
      withPartner: false,
      partnerName: "",
      withChildren: false,
      children: [],
      drinks: [],
      allergies: "",
    },
  });

  const withPartner = watch("withPartner");
  const withChildren = watch("withChildren");
  const status = watch("status");
  const selectedDrinks = watch("drinks") ?? [];
  const isDeclined = status === "declined";

  const toggleDrink = (drink: RsvpFormValues["drinks"][number]) => {
    const next = selectedDrinks.includes(drink)
      ? selectedDrinks.filter((d) => d !== drink)
      : [...selectedDrinks, drink];
    setValue("drinks", next, { shouldValidate: true });
  };

  const onSubmit = async (data: RsvpFormValues) => {
    setSubmitError(null);
    const result = await submitRsvp({
      ...data,
      guestId: data.guestId?.trim() || guestId,
      drinks: data.status === "declined" ? [] : data.drinks,
      partnerName: data.withPartner ? data.partnerName : undefined,
      withChildren: data.status === "declined" ? false : data.withChildren,
      children:
        data.withChildren && data.status !== "declined" ? data.children : [],
      allergies: data.allergies?.trim() || undefined,
    });

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }

    setLastStatus(data.status);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Section
        id="rsvp"
        title="Спасибо!"
        description={
          lastStatus === "declined"
            ? "Мы получили ваш ответ."
            : "Ваш ответ сохранён. Ждём вас на празднике!"
        }
      >
        <div className="flex flex-col items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 py-10 text-center">
          <CheckCircle2 className="h-10 w-10 text-neutral-700" aria-hidden />
          <p className="text-sm text-neutral-600">
            {lastStatus === "declined"
              ? "Жаль, что не получится. Будем рады видеть вас в другой раз!"
              : "Мы получили вашу анкету. До встречи!"}
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
      description={RSVP_SECTION_DESCRIPTION ?? undefined}
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
        <div>
          <Label htmlFor="name">Имя и фамилия</Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Иван Иванов"
            {...register("name")}
          />
          {errors.name ? (
            <p className="mt-1.5 text-sm text-red-600" role="alert">
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-neutral-800">
            Статус
          </legend>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {STATUS_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 text-sm transition-colors",
                  "has-[:checked]:border-neutral-900 has-[:checked]:bg-white",
                  "border-neutral-300 bg-white hover:border-neutral-400",
                )}
              >
                <input
                  type="radio"
                  value={opt.value}
                  className="h-4 w-4 accent-neutral-900"
                  {...register("status")}
                />
                {opt.label}
              </label>
            ))}
          </div>
          {errors.status ? (
            <p className="mt-1.5 text-sm text-red-600" role="alert">
              {errors.status.message}
            </p>
          ) : null}
        </fieldset>

        {!isDeclined ? (
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-neutral-800">
              Буду с парой
            </legend>
            <div className="flex gap-3">
              {[
                { value: false, label: "Нет" },
                { value: true, label: "Да" },
              ].map((opt) => (
                <label
                  key={String(opt.value)}
                  className={cn(
                    "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm",
                    "has-[:checked]:border-neutral-900 has-[:checked]:bg-white",
                    "border-neutral-300 bg-white",
                  )}
                >
                  <input
                    type="radio"
                    className="h-4 w-4 accent-neutral-900"
                    checked={withPartner === opt.value}
                    onChange={() =>
                      setValue("withPartner", opt.value, {
                        shouldValidate: true,
                      })
                    }
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        {!isDeclined && withPartner ? (
          <div>
            <Label htmlFor="partnerName">Имя и фамилия партнёра</Label>
            <Input
              id="partnerName"
              placeholder="Мария Иванова"
              {...register("partnerName")}
            />
            {errors.partnerName ? (
              <p className="mt-1.5 text-sm text-red-600" role="alert">
                {errors.partnerName.message}
              </p>
            ) : null}
          </div>
        ) : null}

        {!isDeclined ? (
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-neutral-800">
              Буду с детьми
            </legend>
            <div className="flex gap-3">
              {[
                { value: false, label: "Нет" },
                { value: true, label: "Да" },
              ].map((opt) => (
                <label
                  key={`children-${String(opt.value)}`}
                  className={cn(
                    "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm",
                    "has-[:checked]:border-neutral-900 has-[:checked]:bg-white",
                    "border-neutral-300 bg-white",
                  )}
                >
                  <input
                    type="radio"
                    className="h-4 w-4 accent-neutral-900"
                    checked={withChildren === opt.value}
                    onChange={() => {
                      setValue("withChildren", opt.value, {
                        shouldValidate: true,
                      });
                      if (opt.value && watch("children").length === 0) {
                        setValue("children", [{ name: "", age: "" }]);
                      }
                      if (!opt.value) {
                        setValue("children", []);
                      }
                    }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        {!isDeclined && withChildren ? (
          <ChildrenFields
            control={control}
            register={register}
            errors={errors}
          />
        ) : null}

        {!isDeclined ? (
          <>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-neutral-800">
                Предпочтения по напиткам
              </legend>
              <p className="mb-3 text-xs text-neutral-500">
                Можно выбрать несколько
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {DRINK_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 text-sm",
                      selectedDrinks.includes(opt.value)
                        ? "border-neutral-900 bg-white"
                        : "border-neutral-300 bg-white hover:border-neutral-400",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded accent-neutral-900"
                      checked={selectedDrinks.includes(opt.value)}
                      onChange={() => toggleDrink(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              {errors.drinks ? (
                <p className="mt-1.5 text-sm text-red-600" role="alert">
                  {errors.drinks.message}
                </p>
              ) : null}
            </fieldset>

            <div>
              <Label htmlFor="allergies">
                Пищевые аллергии или пожелания{" "}
                <span className="font-normal text-neutral-500">
                  (необязательно)
                </span>
              </Label>
              <Textarea
                id="allergies"
                placeholder="Например: без орехов, вегетарианское меню..."
                {...register("allergies")}
              />
            </div>
          </>
        ) : null}

        {submitError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {submitError}
          </p>
        ) : null}

        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
          {isSubmitting ? "Отправка…" : "Отправить ответ"}
        </Button>
      </form>
    </Section>
  );
}
