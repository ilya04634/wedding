import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[100px] w-full resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900",
      "placeholder:text-neutral-400",
      "focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200",
      "disabled:cursor-not-allowed disabled:bg-neutral-50",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
