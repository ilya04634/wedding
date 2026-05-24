import type { ChildEntry } from "@/types/child";

/** Для Google Sheets: «Маша — 5 лет; Петя — 3 года» */
export function formatChildrenForSheet(children: ChildEntry[]): string {
  if (!children.length) return "";

  return children
    .map((c) => {
      const name = c.name.trim();
      const age = c.age.trim();
      const ageLabel = /лет|год|мес/i.test(age) ? age : `${age} лет`;
      return `${name} — ${ageLabel}`;
    })
    .join("; ");
}

/** Имена и возрасты отдельными колонками */
export function formatChildrenNamesColumn(children: ChildEntry[]): string {
  return children.map((c) => c.name.trim()).join("; ");
}

export function formatChildrenAgesColumn(children: ChildEntry[]): string {
  return children.map((c) => c.age.trim()).join("; ");
}
