"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Languages } from "lucide-react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { localeNames } from "@/config/site";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LocaleSwitcher() {
  const activeLocale = useLocale() as Locale;
  const t = useTranslations("Nav");
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function switchTo(locale: Locale) {
    setOpen(false);
    router.replace(
      // @ts-expect-error -- pathname + params is valid for next-intl navigation
      { pathname, params },
      { locale },
    );
  }

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={t("switchLanguage")}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Languages className="size-4" />
      </Button>
      {open && (
        <ul
          role="menu"
          className="bg-popover text-popover-foreground absolute right-0 z-50 mt-2 min-w-36 overflow-hidden rounded-md border p-1 shadow-md"
        >
          {locales.map((locale) => (
            <li key={locale} role="none">
              <button
                role="menuitemradio"
                aria-checked={locale === activeLocale}
                onClick={() => switchTo(locale)}
                className={cn(
                  "hover:bg-accent hover:text-accent-foreground flex w-full items-center rounded-sm px-2.5 py-1.5 text-sm transition-colors",
                  locale === activeLocale && "font-medium",
                )}
              >
                {localeNames[locale]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
