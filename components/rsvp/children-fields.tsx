"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RsvpFormValues } from "@/lib/validations/rsvp";
import { Plus, Trash2 } from "lucide-react";
import {
  type Control,
  type FieldErrors,
  type UseFormRegister,
  useFieldArray,
} from "react-hook-form";

interface ChildrenFieldsProps {
  control: Control<RsvpFormValues>;
  register: UseFormRegister<RsvpFormValues>;
  errors: FieldErrors<RsvpFormValues>;
}

export function ChildrenFields({
  control,
  register,
  errors,
}: ChildrenFieldsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "children",
  });

  return (
    <div className="space-y-3">
      <Label>Дети</Label>
      <ul className="space-y-3">
        {fields.map((field, index) => (
          <li
            key={field.id}
            className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-3 sm:flex-row sm:items-start"
          >
            <div className="min-w-0 flex-1">
              <Label htmlFor={`child-name-${index}`} className="text-xs">
                Имя
              </Label>
              <Input
                id={`child-name-${index}`}
                placeholder="Маша"
                {...register(`children.${index}.name`)}
              />
              {errors.children?.[index]?.name ? (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {errors.children[index]?.name?.message}
                </p>
              ) : null}
            </div>
            <div className="w-full sm:w-28">
              <Label htmlFor={`child-age-${index}`} className="text-xs">
                Возраст
              </Label>
              <Input
                id={`child-age-${index}`}
                placeholder="5"
                inputMode="numeric"
                {...register(`children.${index}.age`)}
              />
              {errors.children?.[index]?.age ? (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  {errors.children[index]?.age?.message}
                </p>
              ) : null}
            </div>
            {fields.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                className="mt-6 shrink-0 self-end sm:self-center"
                onClick={() => remove(index)}
                aria-label="Удалить ребёнка"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : (
              <span className="hidden w-10 sm:block" aria-hidden />
            )}
          </li>
        ))}
      </ul>

      {errors.children?.root ?? errors.children?.message ? (
        <p className="text-sm text-red-600" role="alert">
          {errors.children?.root?.message ?? errors.children?.message}
        </p>
      ) : null}

      <Button
        type="button"
        variant="secondary"
        className="w-full sm:w-auto"
        onClick={() => append({ name: "", age: "" })}
      >
        <Plus className="mr-2 h-4 w-4" aria-hidden />
        Добавить ребёнка
      </Button>
    </div>
  );
}
