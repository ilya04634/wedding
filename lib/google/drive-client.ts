import "server-only";

import { google } from "googleapis";
import { getGoogleClientEmail, getGooglePrivateKey } from "./auth";

const DRIVE_SCOPES = ["https://www.googleapis.com/auth/drive"];

export function getDriveClient() {
  const oauthClientId = process.env.GOOGLE_DRIVE_CLIENT_ID?.trim();
  const oauthClientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET?.trim();
  const oauthRefreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN?.trim();

  if (oauthClientId && oauthClientSecret && oauthRefreshToken) {
    const auth = new google.auth.OAuth2(oauthClientId, oauthClientSecret);
    auth.setCredentials({ refresh_token: oauthRefreshToken });

    return google.drive({ version: "v3", auth });
  }

  const auth = new google.auth.JWT({
    email: getGoogleClientEmail(),
    key: getGooglePrivateKey(),
    scopes: DRIVE_SCOPES,
  });

  return google.drive({ version: "v3", auth });
}
