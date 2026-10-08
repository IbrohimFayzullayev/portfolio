import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";

import messages from "@/messages/en.json";
import {
  ContactForm,
  MAX_MESSAGE,
  MIN_MESSAGE,
  validate,
} from "@/components/contact-form";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderForm() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <ContactForm />
    </NextIntlClientProvider>,
  );
}

async function fill(name: string, email: string, message: string) {
  const user = userEvent.setup();
  if (name) await user.type(screen.getByLabelText("Name"), name);
  if (email) await user.type(screen.getByLabelText("Email"), email);
  if (message) await user.type(screen.getByLabelText("Message"), message);
  await user.click(screen.getByRole("button", { name: "Send message" }));
}

describe("validate", () => {
  const ok = { name: "A", email: "a@b.co", message: "x".repeat(MIN_MESSAGE) };

  it("accepts a complete message", () => {
    expect(validate(ok)).toBeUndefined();
  });

  it("reports the first problem, in field order", () => {
    expect(validate({ ...ok, name: " " })?.field).toBe("name");
    expect(validate({ ...ok, email: "nope" })?.key).toBe("errorEmail");
    expect(validate({ ...ok, message: "short" })?.key).toBe(
      "errorMessageShort",
    );
    expect(validate({ ...ok, message: "x".repeat(MAX_MESSAGE + 1) })?.key).toBe(
      "errorMessageLong",
    );
  });

  it("counts characters, not UTF-16 units", () => {
    // Ten emoji are ten characters to a person and twenty to .length.
    expect(
      validate({ ...ok, message: "😀".repeat(MIN_MESSAGE) }),
    ).toBeUndefined();
  });
});

describe("<ContactForm>", () => {
  it("does not call the server while the form is invalid", async () => {
    renderForm();
    await fill("Dilnoza", "not-an-email", "A long enough message.");

    expect(screen.getByRole("alert")).toHaveTextContent(/valid email/i);
    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText("Email")).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the message with the page locale and confirms", async () => {
    fetchMock.mockResolvedValue({ status: 201 } as Response);
    renderForm();
    await fill("Dilnoza", "dilnoza@example.com", "A long enough message.");

    await screen.findByRole("status");
    expect(screen.getByText("Message sent")).toBeInTheDocument();

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/contact");
    expect(JSON.parse(String(init.body))).toEqual({
      name: "Dilnoza",
      email: "dilnoza@example.com",
      message: "A long enough message.",
      locale: "en",
      website: "",
    });
  });

  it.each([
    [429, /too many messages/i],
    [400, /was not accepted/i],
    [502, /could not be sent/i],
  ])("explains a %i and keeps what was typed", async (status, text) => {
    fetchMock.mockResolvedValue({ status } as Response);
    renderForm();
    await fill("Dilnoza", "dilnoza@example.com", "A long enough message.");

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(text),
    );
    // Losing a typed message to a failed send is the worst outcome a contact
    // form has.
    expect(screen.getByLabelText("Message")).toHaveValue(
      "A long enough message.",
    );
  });

  it("treats a network failure as 'could not be sent'", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));
    renderForm();
    await fill("Dilnoza", "dilnoza@example.com", "A long enough message.");

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/could not be sent/i),
    );
  });
});
