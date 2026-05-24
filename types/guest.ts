export interface Guest {
  /** Уникальный алиас в URL, напр. ivan */
  id: string;
  /** Имя для обращения на приглашении */
  name: string;
  /** Публичный URL фона (Google Drive) */
  bgUrl: string | null;
  /** Статус генерации фона: pending | done | error */
  status: string | null;
}
