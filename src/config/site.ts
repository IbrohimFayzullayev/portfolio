import type { Locale } from "@/i18n/routing";

export const siteConfig = {
  name: "Ibrohim",
  title: "Ibrohim — Software Engineer & Writer",
  description:
    "Portfolio and engineering blog of Ibrohim — building thoughtful, performant products with modern web technology.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  ),
  author: {
    name: "Ibrohim",
    email: "ibrokhim.fayzullaev.dev@gmail.com",
    telegram: "https://t.me/Ibrohim_Fayzullayev",
    telegramHandle: "@Ibrohim_Fayzullayev",
    // tel: link uchun raqamlarsiz format, ko'rsatish uchun o'qiladigan format
    phone: "+998992550337",
    phoneDisplay: "+998 99 255 03 37",
    github: "https://github.com/IbrohimFayzullayev",
    linkedin: "https://www.linkedin.com/in/ibrohim-fayzullayev/",
  },
  // Used for default OG image alt / branding.
  ogImageAlt: "Ibrohim — Software Engineer & Writer",
} as const;

export type SiteConfig = typeof siteConfig;

/** Absolute URL helper for a given path. */
export function absoluteUrl(path = ""): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export const localeNames: Record<Locale, string> = {
  en: "English",
  uz: "O‘zbekcha",
};
