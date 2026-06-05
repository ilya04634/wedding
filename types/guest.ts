export type GuestPersonType = "adult" | "child";

export interface GuestPerson {
  id: string;
  inviteName: string | null;
  personName: string;
  personType: GuestPersonType;
  childAge: string | null;
  prompt: string | null;
  inviteText: string | null;
  noDeclension: boolean;
  informalTone: boolean;
  bgUrl: string | null;
  inviteUrl: string | null;
  status: string | null;
  statusUpdatedAt: string | null;
  sheetRow: number;
}

export interface GuestInvite {
  id: string;
  inviteName: string;
  people: GuestPerson[];
  prompt: string | null;
  inviteText: string | null;
  noDeclension: boolean;
  informalTone: boolean;
  bgUrl: string | null;
  inviteUrl: string | null;
  status: string | null;
  statusUpdatedAt: string | null;
}
