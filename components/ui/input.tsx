import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900",
        "placeholder:text-neutral-400",
        "focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200",
        "disabled:cursor-not-allowed disabled:bg-neutral-50",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
