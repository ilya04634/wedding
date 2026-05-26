import type { GuestPersonType } from "./guest";

export type RsvpStatus = "confirmed" | "maybe" | "declined";

export type DrinkPreference = "wine" | "champagne" | "strong" | "no_alcohol";

export interface RsvpPersonData {
  personName: string;
  personType: GuestPersonType;
  status: RsvpStatus;
  drink: DrinkPreference | "not_applicable";
  allergens?: string;
}

export interface RsvpFormData {
  guestId?: string;
  people: RsvpPersonData[];
}
