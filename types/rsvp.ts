import type { ChildEntry } from "./child";

/** Статус ответа гостя */
export type RsvpStatus = "confirmed" | "maybe" | "declined";

/** Напитки (можно выбрать несколько) */
export type DrinkPreference = "wine" | "strong" | "non_alcoholic";

export interface RsvpFormData {
  guestId?: string;
  name: string;
  status: RsvpStatus;
  withPartner: boolean;
  partnerName?: string;
  withChildren: boolean;
  children: ChildEntry[];
  drinks: DrinkPreference[];
  allergies?: string;
}
