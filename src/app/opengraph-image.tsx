import { ImageResponse } from "next/og";

export const alt = "Ethan's Drawings — Portfolio manga e illustrazioni";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#1a1a2e",
          padding: "80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#c9a87c",
          }}
        >
          Ethan&apos;s Drawings
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div style={{ fontSize: 84, color: "#faf9f7", lineHeight: 1 }}>
            Dove il disegno prende forma.
          </div>
          <div style={{ fontSize: 34, color: "rgba(250,249,247,0.65)" }}>
            Tavole manga, illustrazioni e commissioni artistiche.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
