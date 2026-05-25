import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Feirinhas — Gestão de Feiras Livres"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #E8560A 0%, #f97316 60%, #1D9E75 100%)",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        {/* Card central */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "rgba(255,255,255,0.12)",
            borderRadius: "32px",
            padding: "56px 80px",
            border: "2px solid rgba(255,255,255,0.3)",
          }}
        >
          {/* Ícone de barraquinha */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 96,
              height: 96,
              borderRadius: "24px",
              background: "rgba(255,255,255,0.2)",
              marginBottom: "24px",
              fontSize: "48px",
            }}
          >
            🏪
          </div>

          <div
            style={{
              fontSize: "64px",
              fontWeight: "900",
              color: "white",
              letterSpacing: "-2px",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            Feirinhas
          </div>
          <div
            style={{
              fontSize: "26px",
              color: "rgba(255,255,255,0.9)",
              textAlign: "center",
              maxWidth: "700px",
              lineHeight: "1.4",
              marginBottom: "32px",
            }}
          >
            O sistema operacional das feiras livres do Brasil
          </div>

          {/* Pills */}
          <div style={{ display: "flex", gap: "12px" }}>
            {["Organizadores", "Feirantes", "Consumidores"].map((label) => (
              <div
                key={label}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "1.5px solid rgba(255,255,255,0.4)",
                  borderRadius: "100px",
                  padding: "8px 20px",
                  color: "white",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Badge APRAMAR */}
        <div
          style={{
            position: "absolute",
            bottom: "36px",
            right: "48px",
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "100px",
            padding: "6px 16px",
            color: "rgba(255,255,255,0.8)",
            fontSize: "15px",
            fontWeight: "600",
            letterSpacing: "0.05em",
          }}
        >
          APRAMAR
        </div>
      </div>
    ),
    { ...size }
  )
}
