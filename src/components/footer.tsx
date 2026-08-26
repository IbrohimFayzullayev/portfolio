import { useTranslations } from "next-intl";
import { Github, Linkedin, Mail, Rss, Send } from "lucide-react";

import { siteConfig } from "@/config/site";

export function Footer() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-1">
          <p className="text-sm font-medium">
            © {year} {siteConfig.name}. {t("rights")}
          </p>
          <p className="text-sm text-muted-foreground">{t("builtWith")}</p>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground">
          <a
            href={siteConfig.author.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="transition-colors hover:text-foreground"
          >
            <Github className="size-5" />
          </a>
          <a
            href={siteConfig.author.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="transition-colors hover:text-foreground"
          >
            <Linkedin className="size-5" />
          </a>
          <a
            href={siteConfig.author.telegram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            className="transition-colors hover:text-foreground"
          >
            <Send className="size-5" />
          </a>
          <a
            href={`mailto:${siteConfig.author.email}`}
            aria-label="Email"
            className="transition-colors hover:text-foreground"
          >
            <Mail className="size-5" />
          </a>
          <a
            href="/feed.xml"
            aria-label={t("rss")}
            className="transition-colors hover:text-foreground"
          >
            <Rss className="size-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
