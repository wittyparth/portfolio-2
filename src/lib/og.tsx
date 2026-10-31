import { readFile } from "node:fs/promises";
import { ImageResponse } from "next/og";
import { profile } from "./content";

export const ogSize = { width: 1200, height: 630 };

// Geist SemiBold (OFL) so titles match the site; the bundled default font has only one weight.
// An asset URL, so the font is bundled with the function on Vercel (a cwd-relative path is not traced).
const semibold = readFile(new URL("../assets/Geist-SemiBold.ttf", import.meta.url));

/** The share card for posts and projects: black, quiet, the title doing the work. */
export async function ogCard({ kicker, title, footer }: { kicker: string; title: string; footer: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#0a0a0a",
          color: "#fafafa",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 26, color: "#a3a3a3" }}>
          <div
            style={{
              width: 52, height: 52, borderRadius: 999, background: "#fafafa", color: "#0a0a0a",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontFamily: "Geist SemiBold",
            }}
          >
            PS
          </div>
          {profile.name} · {kicker}
        </div>
        <div style={{ display: "flex", fontSize: title.length > 48 ? 64 : 76, fontFamily: "Geist SemiBold", letterSpacing: "-0.03em", lineHeight: 1.08, maxWidth: 1000 }}>
          {title}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#a3a3a3" }}>
          <span>{footer}</span>
          <span>{profile.site.replace(/^https?:\/\//, "")}</span>
        </div>
      </div>
    ),
    { ...ogSize, fonts: [{ name: "Geist SemiBold", data: await semibold, weight: 600 }] },
  );
}
