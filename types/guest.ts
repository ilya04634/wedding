export type GuestPersonType = "adult" | "child";

export interface GuestPerson {
  id: string;
  inviteName: string | null;
  personName: string;
  personType: GuestPersonType;
  childAge: string | null;
  bgUrl: string | null;
  inviteUrl: string | null;
  status: string | null;
  sheetRow: number;
}

export interface GuestInvite {
  id: string;
  inviteName: string;
  people: GuestPerson[];
  bgUrl: string | null;
  inviteUrl: string | null;
  status: string | null;
}
