import "server-only";

import { createHash } from "node:crypto";
import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "wedding_admin";
const ADMIN_PASSWORD_NOT_CONFIGURED = "ADMIN_PASSWORD_NOT_CONFIGURED";
const INVALID_ADMIN_PASSWORD = "INVALID_ADMIN_PASSWORD";

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD?.trim();
}

export function isAdminPasswordConfigured() {
  return Boolean(getAdminPassword());
}

function getAdminToken() {
  const password = getAdminPassword();
  if (!password) return null;

  return createHash("sha256").update(password).digest("hex");
}

export function isAdminAuthenticated() {
  const token = getAdminToken();
  if (!token) return false;

  return cookies().get(ADMIN_COOKIE_NAME)?.value === token;
}

export function assertAdminAuthenticated() {
  if (!isAdminAuthenticated()) {
    throw new Error("Unauthorized");
  }
}

export function setAdminSession(password: string) {
  const expectedPassword = getAdminPassword();
  const token = getAdminToken();

  if (!expectedPassword || !token) {
    throw new Error(ADMIN_PASSWORD_NOT_CONFIGURED);
  }

  if (password !== expectedPassword) {
    throw new Error(INVALID_ADMIN_PASSWORD);
  }

  cookies().set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export function clearAdminSession() {
  cookies().delete(ADMIN_COOKIE_NAME);
}
