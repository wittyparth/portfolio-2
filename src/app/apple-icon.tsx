import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// The "PS" monogram from the hero, as the site icon.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#fafafa",
          borderRadius: 0,
          fontSize: 80,
          fontWeight: 700,
          letterSpacing: "-0.06em",
        }}
      >
        PS
      </div>
    ),
    size,
  );
}
