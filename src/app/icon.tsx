import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
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
          borderRadius: "50%",
          fontSize: 30,
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
