import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

export const runtime = "edge";

const size = { width: 1200, height: 630 };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") ?? siteConfig.title).slice(0, 120);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 20% 0%, #1f1f1f 0%, #0a0a0a 60%)",
          padding: "80px",
          color: "#fafafa",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 32 }}>
          <span style={{ fontWeight: 700 }}>{siteConfig.name}</span>
          <span style={{ color: "#a1a1a1" }}>.dev</span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            maxWidth: "900px",
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 28,
            color: "#a1a1a1",
          }}
        >
          <span>{siteConfig.author.name}</span>
          <span>{new URL(siteConfig.url).host}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
