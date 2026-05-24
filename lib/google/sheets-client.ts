import "server-only";

import { google } from "googleapis";
import { getGoogleClientEmail, getGooglePrivateKey } from "./auth";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export function getSheetsClient() {
  const auth = new google.auth.JWT({
    email: getGoogleClientEmail(),
    key: getGooglePrivateKey(),
    scopes: SCOPES,
  });

  return google.sheets({ version: "v4", auth });
}
