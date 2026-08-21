import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// O'zbekcha oy nomlari — Node'da "uz-UZ" ICU ma'lumoti to'liq emas, shuning uchun
// Intl'ga tayanmaymiz (aks holda server "2026 M06 8", brauzer "8-iyun, 2026" beradi
// va hydration mismatch chiqadi). Bu ro'yxat server va klientda bir xil natija beradi.
const UZ_MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];

export function formatDate(date: string | Date, locale = "en"): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (locale === "uz") {
    // UTC'dan foydalanamiz — server va klient vaqt mintaqasi farq qilsa ham
    // sana bir xil bo'lib qolishi uchun.
    return `${d.getUTCDate()}-${UZ_MONTHS[d.getUTCMonth()]}, ${d.getUTCFullYear()}`;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(d);
}
