import type { SiteSettings } from "@/types/settings";

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  coupleNames: "Илья и Дарья",
  siteTitle: "Приглашение на свадьбу",
  navTitle: "Приглашение",
  heroFamilyName: "Коваль",
  heroDefaultEyebrow: "Приглашаем вас на свадьбу",
  heroPersonalEyebrowTemplate: "{{guestName}}, приглашаем вас на свадьбу",
  heroSubtitle: "Летняя свадьба в садовом настроении",
  heroText:
    "Будем счастливы разделить с вами день, который станет началом нашей семейной истории.",
  weddingDate: "21 июля 2026",
  weddingTime: "13:00",
  weddingVenue: "Jannat Regency",
  weddingAddressLine: "Аалы Токомбаева улица, 21/2, Бишкек",
  weddingMapUrl: "https://go.2gis.com/F89Ms",
  programTitle: "Программа дня",
  programDescription:
    "Основные моменты дня. Если детали изменятся, мы сообщим гостям заранее.",
  programItems: [
    {
      time: "13:00",
      title: "Сбор гостей",
      description: "Welcome-зона, легкие напитки и первые фотографии",
    },
    {
      time: "14:00",
      title: "Церемония",
      description: "Торжественная часть и теплые слова",
    },
    {
      time: "15:30",
      title: "Банкет",
      description: "Ужин, поздравления и праздничная программа",
    },
    {
      time: "18:00",
      title: "Танцы",
      description: "Музыка, танцы и продолжение вечера",
    },
  ],
  rsvpDescription:
    "Пожалуйста, заполните анкету до 1 июля 2026. Ответ можно указать отдельно для каждого гостя из приглашения.",
  inviteLabel: "Приглашение",
  inviteBodyText: "приглашаем вас разделить с нами день нашей свадьбы",
  inviteChildrenPrefix: "Также будем очень рады видеть:",
  inviteGuestCountTemplate: "{{count}} приглашенных в этой ссылке",
  invitePrimaryButtonLabel: "Перейти к основной странице",
  inviteRsvpButtonLabel: "Перейти сразу к анкете",
  inviteMissingBackgroundText:
    "Персональный фон появится здесь после генерации.",
  footerText: "С любовью",
  uploadLinkEnabled: false,
  uploadLinkLabel: "Загрузить фото и видео",
  sectionOrder: [
    "countdown",
    "program",
    "dressCode",
    "wishWall",
    "rsvp",
    "final",
  ],
  enabledSections: [
    "countdown",
    "program",
    "dressCode",
    "wishWall",
    "rsvp",
    "final",
  ],
  wishWallLayout: "masonry",
  wishWallDensity: "balanced",
  wishWallMaxTilt: 5,
  wishWallOverlap: 12,
};

export function serializeProgramItems(settings: SiteSettings) {
  return JSON.stringify(settings.programItems, null, 2);
}
