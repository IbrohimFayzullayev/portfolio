import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TableOfContents } from "@/components/table-of-contents";

describe("<TableOfContents>", () => {
  const toc = [
    { title: "Intro", url: "#intro", depth: 2 },
    { title: "Details", url: "#details", depth: 3 },
  ];

  it("renders a labelled nav with a link per entry", () => {
    render(<TableOfContents toc={toc} label="On this page" />);

    const nav = screen.getByRole("navigation", { name: "On this page" });
    expect(nav).toBeInTheDocument();

    const intro = screen.getByRole("link", { name: "Intro" });
    expect(intro).toHaveAttribute("href", "#intro");
    expect(screen.getByRole("link", { name: "Details" })).toHaveAttribute(
      "href",
      "#details",
    );
  });

  it("renders nothing when there are no entries", () => {
    const { container } = render(
      <TableOfContents toc={[]} label="On this page" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("ignores headings deeper than h3", () => {
    render(
      <TableOfContents
        toc={[{ title: "Too deep", url: "#deep", depth: 4 }]}
        label="TOC"
      />,
    );
    expect(screen.queryByRole("link", { name: "Too deep" })).toBeNull();
  });
});
