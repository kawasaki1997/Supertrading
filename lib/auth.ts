import { cookies } from "next/headers";

export const AUTH_COOKIE = "st_auth";

function token() {
  return process.env.AUTH_TOKEN ?? "";
}

/** True if the current request carries a valid admin session cookie. */
export async function isAuthed(): Promise<boolean> {
  const jar = await cookies();
  return !!token() && jar.get(AUTH_COOKIE)?.value === token();
}

/** Verify password and set the session cookie. Returns false if wrong. */
export async function signIn(password: string): Promise<boolean> {
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return false;
  }
  const jar = await cookies();
  jar.set(AUTH_COOKIE, token(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return true;
}

export async function signOut(): Promise<void> {
  const jar = await cookies();
  jar.delete(AUTH_COOKIE);
}
