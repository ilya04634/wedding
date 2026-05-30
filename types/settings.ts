export interface ProgramItem {
  time: string;
  title: string;
  description: string;
}

export type WishWallLayout =
  | "masonry"
  | "staggered"
  | "garland"
  | "featured"
  | "ribbon"
  | "random";

export type WishWallDensity = "airy" | "balanced" | "compact";
export type RevealAnimationMode = "once" | "repeat" | "off";
export type RevealAnimationSpeed = "fast" | "medium" | "smooth";
export type RevealAnimationTrigger = "early" | "medium" | "late";

export interface SiteSettings {
  coupleNames: string;
  siteTitle: string;
  navTitle: string;
  heroFamilyName: string;
  heroDefaultEyebrow: string;
  heroPersonalEyebrowTemplate: string;
  heroSubtitle: string;
  heroText: string;
  weddingDate: string;
  weddingTime: string;
  weddingVenue: string;
  weddingAddressLine: string;
  weddingMapUrl: string;
  programTitle: string;
  programDescription: string;
  programItems: ProgramItem[];
  rsvpDescription: string;
  rsvpAlcoholEnabled: boolean;
  rsvpAlcoholOptions: string[];
  inviteLabel: string;
  inviteBodyText: string;
  inviteChildrenPrefix: string;
  inviteGuestCountTemplate: string;
  invitePrimaryButtonLabel: string;
  inviteRsvpButtonLabel: string;
  inviteMissingBackgroundText: string;
  footerText: string;
  uploadLinkEnabled: boolean;
  uploadLinkLabel: string;
  sectionOrder: string[];
  enabledSections: string[];
  wishWallLayout: WishWallLayout;
  wishWallDensity: WishWallDensity;
  wishWallMaxTilt: number;
  wishWallOverlap: number;
  revealAnimationMode: RevealAnimationMode;
  revealAnimationSpeed: RevealAnimationSpeed;
  revealAnimationTrigger: RevealAnimationTrigger;
  revealAnimationDistance: number;
}
