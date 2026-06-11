import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export type AppSession = {
  userId: string;
};

const COOKIE_NAME = "redondo_session";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function getSessionSecret(): string {
  const secret =
    process.env.AUTH_SESSION_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!secret) {
    throw new Error("Configure AUTH_SESSION_SECRET para usar login por cookie.");
  }

  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function safeCompare(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function setAppSession(userId: string) {
  const issuedAt = Date.now().toString();
  const payload = `${userId}.${issuedAt}`;
  const signature = sign(payload);

  cookies().set(COOKIE_NAME, `${payload}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR_SECONDS
  });
}

export function clearAppSession() {
  cookies().delete(COOKIE_NAME);
}

export function getAppSession(): AppSession | null {
  const value = cookies().get(COOKIE_NAME)?.value;

  if (!value) {
    return null;
  }

  const parts = value.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [userId, issuedAt, signature] = parts;
  const expected = sign(`${userId}.${issuedAt}`);

  if (!safeCompare(signature, expected)) {
    return null;
  }

  return { userId };
}
