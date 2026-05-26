export function getSiteUrl() {
  const configuredUrl = process.env.SITE_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

export function buildPublicInviteUrl(inviteId: string) {
  return `${getSiteUrl()}/i/${encodeURIComponent(inviteId)}`;
}
