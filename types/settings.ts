export interface ProgramItem {
  time: string;
  title: string;
  description: string;
}

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
}
