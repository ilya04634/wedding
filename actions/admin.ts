"use server";

import {
  assertAdminAuthenticated,
  clearAdminSession,
  setAdminSession,
} from "@/lib/admin/auth";
import {
  fillMissingGuestIds,
  getInviteById,
  updateGuestPerson,
  updateInviteBackground,
  type GuestPersonUpdate,
} from "@/lib/google/guests";
import { resolveInviteBackground } from "@/lib/invite/background-service";
import { buildPublicInviteUrl } from "@/lib/invite/url";
import {
  settingsToFormData,
  updateSiteSettings,
  type SiteSettingsFormData,
} from "@/lib/google/settings";
import { DEFAULT_SITE_SETTINGS } from "@/lib/settings/defaults";
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
  } catch (error) {
    const code =
      error instanceof Error && error.message === "ADMIN_PASSWORD_NOT_CONFIGURED"
        ? "not-configured"
        : "invalid";
    redirect(`/admin?error=${code}`);
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
    prompt: getRequiredString(formData, "prompt"),
    bgUrl: getRequiredString(formData, "bgUrl"),
    inviteUrl: getRequiredString(formData, "inviteUrl"),
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

export async function fillMissingGuestIdsAction() {
  assertAdminAuthenticated();

  await fillMissingGuestIds();
  revalidatePath("/admin");
}

export async function generateInviteBackgroundAction(formData: FormData) {
  assertAdminAuthenticated();

  const id = getRequiredString(formData, "id");
  const invite = await getInviteById(id);
  if (!invite) {
    throw new Error(`Invite not found: ${id}`);
  }

  const inviteUrl = buildPublicInviteUrl(invite.id);

  if (invite.bgUrl && invite.status === "done") {
    await updateInviteBackground(invite.id, invite.bgUrl, "done", inviteUrl);
    revalidatePath("/admin");
    revalidatePath(`/i/${invite.id}`);
    revalidatePath(`/?guestId=${invite.id}`);
    return;
  }

  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (!openaiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  await updateInviteBackground(invite.id, "", "pending");
  const { bgUrl } = await resolveInviteBackground(invite, openaiKey);
  await updateInviteBackground(invite.id, bgUrl, "done", inviteUrl);

  revalidatePath("/admin");
  revalidatePath(`/i/${invite.id}`);
  revalidatePath(`/?guestId=${invite.id}`);
}

export async function updateSiteSettingsAction(formData: FormData) {
  assertAdminAuthenticated();

  const defaults = settingsToFormData(DEFAULT_SITE_SETTINGS);
  const data: SiteSettingsFormData = {
    coupleNames: getRequiredString(formData, "coupleNames") || defaults.coupleNames,
    siteTitle: getRequiredString(formData, "siteTitle") || defaults.siteTitle,
    navTitle: getRequiredString(formData, "navTitle") || defaults.navTitle,
    heroFamilyName:
      getRequiredString(formData, "heroFamilyName") || defaults.heroFamilyName,
    heroDefaultEyebrow:
      getRequiredString(formData, "heroDefaultEyebrow") ||
      defaults.heroDefaultEyebrow,
    heroPersonalEyebrowTemplate:
      getRequiredString(formData, "heroPersonalEyebrowTemplate") ||
      defaults.heroPersonalEyebrowTemplate,
    heroSubtitle:
      getRequiredString(formData, "heroSubtitle") || defaults.heroSubtitle,
    heroText: getRequiredString(formData, "heroText") || defaults.heroText,
    weddingDate: getRequiredString(formData, "weddingDate") || defaults.weddingDate,
    weddingTime: getRequiredString(formData, "weddingTime") || defaults.weddingTime,
    weddingVenue:
      getRequiredString(formData, "weddingVenue") || defaults.weddingVenue,
    weddingAddressLine:
      getRequiredString(formData, "weddingAddressLine") ||
      defaults.weddingAddressLine,
    weddingMapUrl:
      getRequiredString(formData, "weddingMapUrl") || defaults.weddingMapUrl,
    programTitle:
      getRequiredString(formData, "programTitle") || defaults.programTitle,
    programDescription:
      getRequiredString(formData, "programDescription") ||
      defaults.programDescription,
    programItemsJson:
      getRequiredString(formData, "programItemsJson") || defaults.programItemsJson,
    rsvpDescription:
      getRequiredString(formData, "rsvpDescription") ||
      defaults.rsvpDescription,
    inviteLabel:
      getRequiredString(formData, "inviteLabel") || defaults.inviteLabel,
    inviteBodyText:
      getRequiredString(formData, "inviteBodyText") || defaults.inviteBodyText,
    inviteChildrenPrefix:
      getRequiredString(formData, "inviteChildrenPrefix") ||
      defaults.inviteChildrenPrefix,
    inviteGuestCountTemplate:
      getRequiredString(formData, "inviteGuestCountTemplate") ||
      defaults.inviteGuestCountTemplate,
    invitePrimaryButtonLabel:
      getRequiredString(formData, "invitePrimaryButtonLabel") ||
      defaults.invitePrimaryButtonLabel,
    inviteRsvpButtonLabel:
      getRequiredString(formData, "inviteRsvpButtonLabel") ||
      defaults.inviteRsvpButtonLabel,
    inviteMissingBackgroundText:
      getRequiredString(formData, "inviteMissingBackgroundText") ||
      defaults.inviteMissingBackgroundText,
    footerText: getRequiredString(formData, "footerText") || defaults.footerText,
    uploadLinkEnabled: formData.get("uploadLinkEnabled") ? "true" : "false",
    uploadLinkLabel:
      getRequiredString(formData, "uploadLinkLabel") ||
      defaults.uploadLinkLabel,
    sectionOrder:
      getRequiredString(formData, "sectionOrder") || defaults.sectionOrder,
    wishWallLayout:
      getRequiredString(formData, "wishWallLayout") || defaults.wishWallLayout,
    wishWallDensity:
      getRequiredString(formData, "wishWallDensity") ||
      defaults.wishWallDensity,
    wishWallMaxTilt:
      getRequiredString(formData, "wishWallMaxTilt") ||
      defaults.wishWallMaxTilt,
    wishWallOverlap:
      getRequiredString(formData, "wishWallOverlap") ||
      defaults.wishWallOverlap,
  };

  await updateSiteSettings(data);
  revalidatePath("/");
  revalidatePath("/admin");
}
