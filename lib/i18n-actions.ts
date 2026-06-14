"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, type Locale } from "./i18n";

export async function setLocale(locale: Locale) {
  const jar = await cookies();
  jar.set(LOCALE_COOKIE, locale === "en" ? "en" : "vi", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
