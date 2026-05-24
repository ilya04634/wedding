import "server-only";

import { google } from "googleapis";
import { getGoogleClientEmail, getGooglePrivateKey } from "./auth";

const DRIVE_SCOPES = ["https://www.googleapis.com/auth/drive"];

export function getDriveClient() {
  const auth = new google.auth.JWT({
    email: getGoogleClientEmail(),
    key: getGooglePrivateKey(),
    scopes: DRIVE_SCOPES,
  });

  return google.drive({ version: "v3", auth });
}
