export interface ProgramItem {
  time: string;
  title: string;
  description: string;
}

export interface SiteSettings {
  coupleNames: string;
  siteTitle: string;
  navTitle: string;
  heroDefaultEyebrow: string;
  heroPersonalEyebrowTemplate: string;
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
  footerText: string;
  uploadLinkEnabled: boolean;
  uploadLinkLabel: string;
}
