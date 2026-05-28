import "server-only";

import type {
  ProgramItem,
  SiteSettings,
  WishWallDensity,
  WishWallLayout,
} from "@/types/settings";
import {
  DEFAULT_SITE_SETTINGS,
  serializeProgramItems,
} from "@/lib/settings/defaults";
import { getGoogleSpreadsheetId } from "./auth";
import { getSheetsClient } from "./sheets-client";

const SETTINGS_SHEET_NAME = process.env.SETTINGS_SHEET_NAME?.trim() || "Settings";

const SETTING_KEYS = [
  "coupleNames",
  "siteTitle",
  "navTitle",
  "heroFamilyName",
  "heroDefaultEyebrow",
  "heroPersonalEyebrowTemplate",
  "heroSubtitle",
  "heroText",
  "weddingDate",
  "weddingTime",
  "weddingVenue",
  "weddingAddressLine",
  "weddingMapUrl",
  "programTitle",
  "programDescription",
  "programItemsJson",
  "rsvpDescription",
  "inviteLabel",
  "inviteBodyText",
  "inviteChildrenPrefix",
  "inviteGuestCountTemplate",
  "invitePrimaryButtonLabel",
  "inviteRsvpButtonLabel",
  "inviteMissingBackgroundText",
  "footerText",
  "uploadLinkEnabled",
  "uploadLinkLabel",
  "sectionOrder",
  "enabledSections",
  "wishWallLayout",
  "wishWallDensity",
  "wishWallMaxTilt",
  "wishWallOverlap",
] as const;

export type SiteSettingKey = (typeof SETTING_KEYS)[number];
export type SiteSettingsFormData = Record<SiteSettingKey, string>;

async function ensureSettingsSheet(): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = getGoogleSpreadsheetId();
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });

  const exists = spreadsheet.data.sheets?.some(
    (sheet) => sheet.properties?.title === SETTINGS_SHEET_NAME,
  );
  if (exists) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title: SETTINGS_SHEET_NAME,
            },
          },
        },
      ],
    },
  });
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined || value.trim() === "") return fallback;
  return ["true", "1", "yes", "on", "да"].includes(value.trim().toLowerCase());
}

function parseProgramItems(value: string | undefined): ProgramItem[] {
  if (!value?.trim()) return DEFAULT_SITE_SETTINGS.programItems;

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return DEFAULT_SITE_SETTINGS.programItems;

    return parsed
      .map((item) => ({
        time: String(item?.time ?? "").trim(),
        title: String(item?.title ?? "").trim(),
        description: String(item?.description ?? "").trim(),
      }))
      .filter((item) => item.time && item.title);
  } catch {
    return DEFAULT_SITE_SETTINGS.programItems;
  }
}

function parseSectionOrder(value: string | undefined): string[] {
  if (!value?.trim()) return DEFAULT_SITE_SETTINGS.sectionOrder;

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => String(item ?? "").trim())
        .filter(Boolean);
    }
  } catch {
    // Fall back to comma/newline parsing below.
  }

  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseSectionList(value: string | undefined, fallback: string[]): string[] {
  if (!value?.trim()) return fallback;

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => String(item ?? "").trim())
        .filter(Boolean);
    }
  } catch {
    // Fall back to comma/newline parsing below.
  }

  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseWishWallLayout(value: string | undefined): WishWallLayout {
  const layout = value?.trim();
  const allowed: WishWallLayout[] = [
    "masonry",
    "staggered",
    "garland",
    "featured",
    "ribbon",
    "random",
  ];

  return allowed.includes(layout as WishWallLayout)
    ? (layout as WishWallLayout)
    : DEFAULT_SITE_SETTINGS.wishWallLayout;
}

function parseWishWallDensity(value: string | undefined): WishWallDensity {
  const density = value?.trim();
  const allowed: WishWallDensity[] = ["airy", "balanced", "compact"];

  return allowed.includes(density as WishWallDensity)
    ? (density as WishWallDensity)
    : DEFAULT_SITE_SETTINGS.wishWallDensity;
}

function parseNumberSetting(value: string | undefined, fallback: number) {
  if (!value?.trim()) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function settingsFromMap(map: Map<string, string>): SiteSettings {
  return {
    coupleNames: map.get("coupleNames") || DEFAULT_SITE_SETTINGS.coupleNames,
    siteTitle: map.get("siteTitle") || DEFAULT_SITE_SETTINGS.siteTitle,
    navTitle: map.get("navTitle") || DEFAULT_SITE_SETTINGS.navTitle,
    heroFamilyName:
      map.get("heroFamilyName") || DEFAULT_SITE_SETTINGS.heroFamilyName,
    heroDefaultEyebrow:
      map.get("heroDefaultEyebrow") ||
      DEFAULT_SITE_SETTINGS.heroDefaultEyebrow,
    heroPersonalEyebrowTemplate:
      map.get("heroPersonalEyebrowTemplate") ||
      DEFAULT_SITE_SETTINGS.heroPersonalEyebrowTemplate,
    heroSubtitle: map.get("heroSubtitle") || DEFAULT_SITE_SETTINGS.heroSubtitle,
    heroText: map.get("heroText") || DEFAULT_SITE_SETTINGS.heroText,
    weddingDate: map.get("weddingDate") || DEFAULT_SITE_SETTINGS.weddingDate,
    weddingTime: map.get("weddingTime") || DEFAULT_SITE_SETTINGS.weddingTime,
    weddingVenue: map.get("weddingVenue") || DEFAULT_SITE_SETTINGS.weddingVenue,
    weddingAddressLine:
      map.get("weddingAddressLine") || DEFAULT_SITE_SETTINGS.weddingAddressLine,
    weddingMapUrl: map.get("weddingMapUrl") || DEFAULT_SITE_SETTINGS.weddingMapUrl,
    programTitle: map.get("programTitle") || DEFAULT_SITE_SETTINGS.programTitle,
    programDescription:
      map.get("programDescription") || DEFAULT_SITE_SETTINGS.programDescription,
    programItems: parseProgramItems(map.get("programItemsJson")),
    rsvpDescription:
      map.get("rsvpDescription") || DEFAULT_SITE_SETTINGS.rsvpDescription,
    inviteLabel: map.get("inviteLabel") || DEFAULT_SITE_SETTINGS.inviteLabel,
    inviteBodyText:
      map.get("inviteBodyText") || DEFAULT_SITE_SETTINGS.inviteBodyText,
    inviteChildrenPrefix:
      map.get("inviteChildrenPrefix") ||
      DEFAULT_SITE_SETTINGS.inviteChildrenPrefix,
    inviteGuestCountTemplate:
      map.get("inviteGuestCountTemplate") ||
      DEFAULT_SITE_SETTINGS.inviteGuestCountTemplate,
    invitePrimaryButtonLabel:
      map.get("invitePrimaryButtonLabel") ||
      DEFAULT_SITE_SETTINGS.invitePrimaryButtonLabel,
    inviteRsvpButtonLabel:
      map.get("inviteRsvpButtonLabel") ||
      DEFAULT_SITE_SETTINGS.inviteRsvpButtonLabel,
    inviteMissingBackgroundText:
      map.get("inviteMissingBackgroundText") ||
      DEFAULT_SITE_SETTINGS.inviteMissingBackgroundText,
    footerText: map.get("footerText") || DEFAULT_SITE_SETTINGS.footerText,
    uploadLinkEnabled: parseBoolean(
      map.get("uploadLinkEnabled"),
      DEFAULT_SITE_SETTINGS.uploadLinkEnabled,
    ),
    uploadLinkLabel:
      map.get("uploadLinkLabel") || DEFAULT_SITE_SETTINGS.uploadLinkLabel,
    sectionOrder: parseSectionOrder(map.get("sectionOrder")),
    enabledSections: parseSectionList(
      map.get("enabledSections"),
      DEFAULT_SITE_SETTINGS.enabledSections,
    ),
    wishWallLayout: parseWishWallLayout(map.get("wishWallLayout")),
    wishWallDensity: parseWishWallDensity(map.get("wishWallDensity")),
    wishWallMaxTilt: parseNumberSetting(
      map.get("wishWallMaxTilt"),
      DEFAULT_SITE_SETTINGS.wishWallMaxTilt,
    ),
    wishWallOverlap: parseNumberSetting(
      map.get("wishWallOverlap"),
      DEFAULT_SITE_SETTINGS.wishWallOverlap,
    ),
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const sheets = getSheetsClient();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: getGoogleSpreadsheetId(),
      range: `${SETTINGS_SHEET_NAME}!A:B`,
    });

    const rows = response.data.values ?? [];
    const map = new Map<string, string>();

    rows.slice(1).forEach((row) => {
      const key = String(row[0] ?? "").trim();
      if (key) map.set(key, String(row[1] ?? ""));
    });

    return settingsFromMap(map);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes(`Unable to parse range: ${SETTINGS_SHEET_NAME}!A:B`)) {
      console.warn("[settings] fallback to defaults", message);
    }
    return DEFAULT_SITE_SETTINGS;
  }
}

export function settingsToFormData(settings: SiteSettings): SiteSettingsFormData {
  return {
    coupleNames: settings.coupleNames,
    siteTitle: settings.siteTitle,
    navTitle: settings.navTitle,
    heroFamilyName: settings.heroFamilyName,
    heroDefaultEyebrow: settings.heroDefaultEyebrow,
    heroPersonalEyebrowTemplate: settings.heroPersonalEyebrowTemplate,
    heroSubtitle: settings.heroSubtitle,
    heroText: settings.heroText,
    weddingDate: settings.weddingDate,
    weddingTime: settings.weddingTime,
    weddingVenue: settings.weddingVenue,
    weddingAddressLine: settings.weddingAddressLine,
    weddingMapUrl: settings.weddingMapUrl,
    programTitle: settings.programTitle,
    programDescription: settings.programDescription,
    programItemsJson: serializeProgramItems(settings),
    rsvpDescription: settings.rsvpDescription,
    inviteLabel: settings.inviteLabel,
    inviteBodyText: settings.inviteBodyText,
    inviteChildrenPrefix: settings.inviteChildrenPrefix,
    inviteGuestCountTemplate: settings.inviteGuestCountTemplate,
    invitePrimaryButtonLabel: settings.invitePrimaryButtonLabel,
    inviteRsvpButtonLabel: settings.inviteRsvpButtonLabel,
    inviteMissingBackgroundText: settings.inviteMissingBackgroundText,
    footerText: settings.footerText,
    uploadLinkEnabled: String(settings.uploadLinkEnabled),
    uploadLinkLabel: settings.uploadLinkLabel,
    sectionOrder: settings.sectionOrder.join("\n"),
    enabledSections: settings.enabledSections.join("\n"),
    wishWallLayout: settings.wishWallLayout,
    wishWallDensity: settings.wishWallDensity,
    wishWallMaxTilt: String(settings.wishWallMaxTilt),
    wishWallOverlap: String(settings.wishWallOverlap),
  };
}

export async function updateSiteSettings(data: SiteSettingsFormData): Promise<void> {
  const sheets = getSheetsClient();
  await ensureSettingsSheet();

  const values = [
    ["key", "value"],
    ...SETTING_KEYS.map((key) => [key, data[key] ?? ""]),
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: getGoogleSpreadsheetId(),
    range: `${SETTINGS_SHEET_NAME}!A1:B${values.length}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}
