"use server";

import {
  assertAdminAuthenticated,
  clearAdminSession,
  setAdminSession,
} from "@/lib/admin/auth";
import {
  fillMissingGuestIds,
  getInviteById,
  listInvites,
  updateInviteText,
  updateGuestPerson,
  updateInviteBackground,
  type GuestPersonUpdate,
} from "@/lib/google/guests";
import { syncBackgroundPoolFromInvites } from "@/lib/google/background-pool";
import { resolveInviteBackground } from "@/lib/invite/background-service";
import { getInvitePreviewName, warmInviteOgImage } from "@/lib/invite/og-preview";
import { buildPublicInviteUrl } from "@/lib/invite/url";
import {
  getSiteSettings,
  settingsToFormData,
  updateSiteSettings,
  type SiteSettingsFormData,
} from "@/lib/google/settings";
import { syncRsvpGuestNamesFromInvites } from "@/lib/google/sheets";
import { DEFAULT_SITE_SETTINGS } from "@/lib/settings/defaults";
import type { GuestPersonType } from "@/types/guest";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function getRequiredString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getEnabledSectionsString(formData: FormData, fallback: string) {
  if (formData.get("enabledSectionsMode") !== "checkboxes") {
    return getRequiredString(formData, "enabledSections") || fallback;
  }

  return formData
    .getAll("enabledSections")
    .map((value) => String(value).trim())
    .filter(Boolean)
    .join("\n");
}

function shouldGenerateInviteBackground(invite: {
  id: string;
  bgUrl: string | null;
  inviteUrl: string | null;
  status: string | null;
  statusUpdatedAt?: string | null;
}) {
  const normalizedStatus = invite.status?.trim().toLowerCase() ?? "";
  if (!invite.id) return false;
  if (normalizedStatus === "pending" && !isStalePending(invite.statusUpdatedAt)) {
    return false;
  }
  if (!invite.bgUrl) return true;
  if (normalizedStatus !== "done") return true;
  return !invite.inviteUrl;
}

function isStalePending(updatedAt?: string | null) {
  if (!updatedAt) return true;

  const timestamp = new Date(updatedAt).getTime();
  if (!Number.isFinite(timestamp)) return true;

  return Date.now() - timestamp > 15 * 60 * 1000;
}

async function getBackgroundGenerationOptions() {
  const settings = await getSiteSettings();
  const allowGeneration = settings.inviteBackgroundGenerationEnabled;
  const openaiKey = process.env.OPENAI_API_KEY?.trim();

  if (allowGeneration && !openaiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return {
    allowGeneration,
    openaiKey,
  };
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
    adminLabel: getRequiredString(formData, "adminLabel"),
    personType: personType === "child" ? "child" : ("adult" as GuestPersonType),
    childAge: getRequiredString(formData, "childAge"),
    prompt: getRequiredString(formData, "prompt"),
    inviteText: getRequiredString(formData, "inviteText"),
    noDeclension: formData.get("noDeclension") === "on",
    informalTone: formData.get("informalTone") === "on",
    bgUrl: getRequiredString(formData, "bgUrl"),
    inviteUrl: getRequiredString(formData, "inviteUrl"),
    status: getRequiredString(formData, "status"),
  };

  await updateGuestPerson(update);
  revalidatePath("/admin");
  revalidatePath(`/i/${update.id}`);
  revalidatePath(`/?guestId=${update.id}`);
}

export async function updateInviteTextAction(formData: FormData) {
  assertAdminAuthenticated();

  const id = getRequiredString(formData, "id");
  const inviteText = getRequiredString(formData, "inviteText");

  await updateInviteText(id, inviteText);
  revalidatePath("/admin");
  revalidatePath(`/i/${id}`);
  revalidatePath(`/?guestId=${id}`);
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

export async function syncRsvpGuestNamesAction() {
  assertAdminAuthenticated();

  const invites = await listInvites();
  await syncRsvpGuestNamesFromInvites(invites);
  revalidatePath("/admin");
}

export async function syncBackgroundPoolAction() {
  assertAdminAuthenticated();

  const invites = await listInvites();
  const result = await syncBackgroundPoolFromInvites(invites);

  for (const reassignment of result.reassignments) {
    await updateInviteBackground(
      reassignment.inviteId,
      reassignment.bgUrl,
      "done",
      buildPublicInviteUrl(reassignment.inviteId),
    );
  }

  for (const inviteId of result.clearedMissingInvites) {
    await updateInviteBackground(
      inviteId,
      "",
      "missing",
      buildPublicInviteUrl(inviteId),
    );
  }

  if (result.reassignments.length || result.clearedMissingInvites.length) {
    await syncBackgroundPoolFromInvites(await listInvites());
  }

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
  const previewName = getInvitePreviewName(invite);

  if (invite.bgUrl && invite.status === "done") {
    await updateInviteBackground(invite.id, invite.bgUrl, "done", inviteUrl);
    await warmInviteOgImage(previewName);
    revalidatePath("/admin");
    revalidatePath(`/i/${invite.id}`);
    revalidatePath(`/?guestId=${invite.id}`);
    return;
  }

  const { allowGeneration, openaiKey } = await getBackgroundGenerationOptions();

  try {
    await updateInviteBackground(invite.id, "", "pending");
    const { bgUrl } = await resolveInviteBackground(invite, {
      allowGeneration,
      forcePool: !allowGeneration,
      openaiApiKey: openaiKey,
    });
    await updateInviteBackground(invite.id, bgUrl, "done", inviteUrl);
  } catch (error) {
    await updateInviteBackground(invite.id, "", "error").catch(() => {});
    throw error;
  }
  await warmInviteOgImage(previewName);

  revalidatePath("/admin");
  revalidatePath(`/i/${invite.id}`);
  revalidatePath(`/?guestId=${invite.id}`);
}

export async function generateMissingInviteBackgroundsAction() {
  assertAdminAuthenticated();

  await fillMissingGuestIds();
  const invites = await listInvites();
  const targets = invites.filter(shouldGenerateInviteBackground);

  if (!targets.length) {
    revalidatePath("/admin");
    return;
  }

  const { allowGeneration, openaiKey } = await getBackgroundGenerationOptions();

  for (const invite of targets) {
    const inviteUrl = buildPublicInviteUrl(invite.id);
    const previewName = getInvitePreviewName(invite);

    try {
      if (invite.bgUrl && invite.status === "done") {
        await updateInviteBackground(invite.id, invite.bgUrl, "done", inviteUrl);
      } else {
        await updateInviteBackground(invite.id, "", "pending");
        const { bgUrl } = await resolveInviteBackground(invite, {
          allowGeneration,
          forcePool: !allowGeneration,
          openaiApiKey: openaiKey,
        });
        await updateInviteBackground(invite.id, bgUrl, "done", inviteUrl);
      }

      await warmInviteOgImage(previewName);
      revalidatePath(`/i/${invite.id}`);
      revalidatePath(`/?guestId=${invite.id}`);
    } catch (error) {
      console.error("[admin generateMissingInviteBackgroundsAction]", {
        id: invite.id,
        error,
      });
      await updateInviteBackground(invite.id, "", "error").catch(() => {});
    }
  }

  revalidatePath("/admin");
}

export async function setInviteBackgroundGenerationAction(formData: FormData) {
  assertAdminAuthenticated();

  const settings = await getSiteSettings();
  const data = settingsToFormData(settings);
  data.inviteBackgroundGenerationEnabled =
    formData.get("enabled") === "true" ? "true" : "false";

  await updateSiteSettings(data);
  revalidatePath("/admin");
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
    rsvpAlcoholEnabled: formData.get("rsvpAlcoholEnabled") ? "true" : "false",
    rsvpAlcoholOptions:
      getRequiredString(formData, "rsvpAlcoholOptions") ||
      defaults.rsvpAlcoholOptions,
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
    inviteBackgroundGenerationEnabled: formData.get(
      "inviteBackgroundGenerationEnabled",
    )
      ? "true"
      : "false",
    footerText: getRequiredString(formData, "footerText") || defaults.footerText,
    uploadLinkEnabled: formData.get("uploadLinkEnabled") ? "true" : "false",
    uploadLinkLabel:
      getRequiredString(formData, "uploadLinkLabel") ||
      defaults.uploadLinkLabel,
    sectionOrder:
      getRequiredString(formData, "sectionOrder") || defaults.sectionOrder,
    enabledSections: getEnabledSectionsString(formData, defaults.enabledSections),
    wishWallLayout:
      getRequiredString(formData, "wishWallLayout") || defaults.wishWallLayout,
    wishWallDensity:
      getRequiredString(formData, "wishWallDensity") ||
      defaults.wishWallDensity,
    wishWallMaxTilt:
      getRequiredString(formData, "wishWallMaxTilt") ||
      String(defaults.wishWallMaxTilt),
    wishWallOverlap:
      getRequiredString(formData, "wishWallOverlap") ||
      String(defaults.wishWallOverlap),
    revealAnimationMode:
      getRequiredString(formData, "revealAnimationMode") ||
      defaults.revealAnimationMode,
    revealAnimationSpeed:
      getRequiredString(formData, "revealAnimationSpeed") ||
      defaults.revealAnimationSpeed,
    revealAnimationTrigger:
      getRequiredString(formData, "revealAnimationTrigger") ||
      defaults.revealAnimationTrigger,
    revealAnimationDistance:
      getRequiredString(formData, "revealAnimationDistance") ||
      String(defaults.revealAnimationDistance),
  };

  await updateSiteSettings(data);
  revalidatePath("/");
  revalidatePath("/admin");
}
