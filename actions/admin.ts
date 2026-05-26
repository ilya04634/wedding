"use server";

import {
  assertAdminAuthenticated,
  clearAdminSession,
  setAdminSession,
} from "@/lib/admin/auth";
import {
  updateGuestPerson,
  updateInviteBackground,
  type GuestPersonUpdate,
} from "@/lib/google/guests";
import type { GuestPersonType } from "@/types/guest";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function getRequiredString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function loginAdmin(formData: FormData) {
  const password = getRequiredString(formData, "password");
  try {
    setAdminSession(password);
  } catch {
    redirect("/admin?error=1");
  }
  redirect("/admin");
}

export async function logoutAdmin() {
  clearAdminSession();
  redirect("/admin");
}

export async function updateGuestPersonAction(formData: FormData) {
  assertAdminAuthenticated();

  const personType = getRequiredString(formData, "personType");
  const update: GuestPersonUpdate = {
    sheetRow: Number(getRequiredString(formData, "sheetRow")),
    id: getRequiredString(formData, "id"),
    inviteName: getRequiredString(formData, "inviteName"),
    personName: getRequiredString(formData, "personName"),
    personType: personType === "child" ? "child" : ("adult" as GuestPersonType),
    childAge: getRequiredString(formData, "childAge"),
    bgUrl: getRequiredString(formData, "bgUrl"),
    status: getRequiredString(formData, "status"),
  };

  await updateGuestPerson(update);
  revalidatePath("/admin");
  revalidatePath(`/i/${update.id}`);
  revalidatePath(`/?guestId=${update.id}`);
}

export async function clearInviteBackgroundAction(formData: FormData) {
  assertAdminAuthenticated();

  const id = getRequiredString(formData, "id");
  await updateInviteBackground(id, "", "");
  revalidatePath("/admin");
  revalidatePath(`/i/${id}`);
  revalidatePath(`/?guestId=${id}`);
}
