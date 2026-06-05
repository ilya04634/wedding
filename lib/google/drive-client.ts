import "server-only";

import { google } from "googleapis";
import { getGoogleClientEmail, getGooglePrivateKey } from "./auth";

const DRIVE_SCOPES = ["https://www.googleapis.com/auth/drive"];

function getServiceAccountDriveAuthClient() {
  return new google.auth.JWT({
    email: getGoogleClientEmail(),
    key: getGooglePrivateKey(),
    scopes: DRIVE_SCOPES,
  });
}

function isInvalidGrantError(error: unknown) {
  if (!(error instanceof Error)) return false;

  const responseData = (
    error as Error & {
      response?: { data?: { error?: string; error_description?: string } };
    }
  ).response?.data;

  return (
    responseData?.error === "invalid_grant" ||
    error.message.toLowerCase().includes("invalid_grant")
  );
}

export function getDriveAuthClient() {
  const oauthClientId = process.env.GOOGLE_DRIVE_CLIENT_ID?.trim();
  const oauthClientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET?.trim();
  const oauthRefreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN?.trim();

  if (oauthClientId && oauthClientSecret && oauthRefreshToken) {
    const auth = new google.auth.OAuth2(oauthClientId, oauthClientSecret);
    auth.setCredentials({ refresh_token: oauthRefreshToken });

    return auth;
  }

  return getServiceAccountDriveAuthClient();
}

export function getServiceAccountDriveClient() {
  return google.drive({
    version: "v3",
    auth: getServiceAccountDriveAuthClient(),
  });
}

export async function getDriveAccessTokenWithFallback() {
  const auth = getDriveAuthClient();

  try {
    const accessToken = await auth.getAccessToken();
    const token =
      typeof accessToken === "string" ? accessToken : accessToken?.token;

    if (token) return token;
  } catch (error) {
    if (!isInvalidGrantError(error)) throw error;
    console.warn("[google-drive] OAuth invalid_grant, falling back to service account");
  }

  const fallbackAuth = getServiceAccountDriveAuthClient();
  const fallbackAccessToken = await fallbackAuth.getAccessToken();
  const fallbackToken =
    typeof fallbackAccessToken === "string"
      ? fallbackAccessToken
      : fallbackAccessToken?.token;

  if (!fallbackToken) {
    throw new Error("Failed to get Google Drive access token");
  }

  return fallbackToken;
}

export function getDriveClient() {
  const auth = getDriveAuthClient();
  return google.drive({ version: "v3", auth });
}

export function shouldFallbackToServiceAccount(error: unknown) {
  if (!isInvalidGrantError(error)) return false;

  console.warn("[google-drive] OAuth invalid_grant, falling back to service account");
  return true;
}
