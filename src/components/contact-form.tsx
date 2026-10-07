"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Mirrors contactMinMessage / contactMaxMessage in the API's
// contact_handler.go. The API is the authority; these only spare the visitor a
// round trip for something the page can already tell them.
export const MIN_MESSAGE = 10;
export const MAX_MESSAGE = 4000;

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

type Status = "idle" | "sending" | "sent";
type Field = "name" | "email" | "message";
type ErrorKey =
  | "errorName"
  | "errorEmail"
  | "errorMessageShort"
  | "errorMessageLong";

/** Which field is wrong and which sentence says so — the first problem only. */
export function validate(values: {
  name: string;
  email: string;
  message: string;
}): { field: Field; key: ErrorKey } | undefined {
  if (!values.name.trim()) return { field: "name", key: "errorName" };
  if (!EMAIL.test(values.email.trim())) {
    return { field: "email", key: "errorEmail" };
  }
  const length = [...values.message.trim()].length;
  if (length < MIN_MESSAGE) {
    return { field: "message", key: "errorMessageShort" };
  }
  if (length > MAX_MESSAGE) {
    return { field: "message", key: "errorMessageLong" };
  }
  return undefined;
}

export function ContactForm() {
  const t = useTranslations("Contact");
  const locale = useLocale();

  const [status, setStatus] = React.useState<Status>("idle");
  const [invalid, setInvalid] = React.useState<Field | undefined>();
  const [error, setError] = React.useState<string | undefined>();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const values = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      message: String(data.get("message") ?? ""),
    };

    const problem = validate(values);
    if (problem) {
      setInvalid(problem.field);
      setError(t(problem.key, { min: MIN_MESSAGE, max: MAX_MESSAGE }));
      form.querySelector<HTMLElement>(`[name="${problem.field}"]`)?.focus();
      return;
    }

    setInvalid(undefined);
    setError(undefined);
    setStatus("sending");

    let responseStatus = 0;
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          locale,
          website: String(data.get("website") ?? ""),
        }),
      });
      responseStatus = response.status;
    } catch {
      // Offline, blocked, aborted — handled as "could not send" below.
    }

    if (responseStatus === 201) {
      setStatus("sent");
      return;
    }

    setStatus("idle");
    setError(
      responseStatus === 429
        ? t("errorRateLimit")
        : responseStatus === 400
          ? t("errorInvalid")
          : t("errorSend"),
    );
  }

  if (status === "sent") {
    return (
      <div
        role="status"
        className="border-border/60 bg-card rounded-lg border p-6"
      >
        <CheckCircle2 className="size-6" aria-hidden="true" />
        <h2 className="mt-4 text-lg font-semibold tracking-tight">
          {t("sentTitle")}
        </h2>
        <p className="text-muted-foreground mt-2">{t("sentText")}</p>
        <Button
          variant="outline"
          className="mt-5"
          onClick={() => setStatus("idle")}
        >
          {t("sendAnother")}
        </Button>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="contact-name" className="text-sm font-medium">
            {t("name")}
          </label>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            maxLength={120}
            disabled={sending}
            aria-invalid={invalid === "name"}
            aria-describedby={invalid === "name" ? "contact-error" : undefined}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="contact-email" className="text-sm font-medium">
            {t("email")}
          </label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            maxLength={200}
            disabled={sending}
            aria-invalid={invalid === "email"}
            aria-describedby={invalid === "email" ? "contact-error" : undefined}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-message" className="text-sm font-medium">
          {t("message")}
        </label>
        <Textarea
          id="contact-message"
          name="message"
          rows={6}
          maxLength={MAX_MESSAGE}
          placeholder={t("messagePlaceholder")}
          disabled={sending}
          aria-invalid={invalid === "message"}
          aria-describedby={invalid === "message" ? "contact-error" : undefined}
        />
      </div>

      {/*
        Honeypot. Off-screen rather than display:none, because the scripts
        this is for skip fields that are plainly hidden. Out of the tab order
        and hidden from assistive tech, so no person ends up filling it in.
      */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] size-px overflow-hidden"
      >
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={sending}>
          {sending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="size-4" aria-hidden="true" />
          )}
          {sending ? t("sending") : t("send")}
        </Button>
        <p
          id="contact-error"
          role="alert"
          className="text-destructive text-sm empty:hidden"
        >
          {error}
        </p>
      </div>
    </form>
  );
}
