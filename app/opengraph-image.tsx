import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "SunScore - Official Solar Savings Calculator";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0f172a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)",
          }}
        />

        {/* Grid pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Sun icon */}
        <div
          style={{
            display: "flex",
            marginBottom: "24px",
          }}
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="url(#sunGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <defs>
              <linearGradient id="sunGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        </div>

        {/* Main title with gradient */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <h1
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              background: "linear-gradient(135deg, #34d399 0%, #06b6d4 100%)",
              backgroundClip: "text",
              color: "transparent",
              margin: 0,
              lineHeight: 1.1,
              textAlign: "center",
            }}
          >
            SunScore
          </h1>
          <p
            style={{
              fontSize: "32px",
              color: "#e2e8f0",
              margin: 0,
              fontWeight: 500,
            }}
          >
            Official Solar Savings Calculator
          </p>
        </div>

        {/* Subtext */}
        <p
          style={{
            fontSize: "24px",
            color: "#94a3b8",
            marginTop: "32px",
            textAlign: "center",
          }}
        >
          Stop Renting Your Power. Get Official NREL Data.
        </p>

        {/* Bottom accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #10b981, #06b6d4, #10b981)",
          }}
        />

        {/* Corner badges */}
        <div
          style={{
            position: "absolute",
            bottom: "30px",
            left: "40px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <span style={{ color: "#94a3b8", fontSize: "16px" }}>Powered by</span>
          <span style={{ color: "#e2e8f0", fontSize: "16px", fontWeight: 600 }}>
            NREL Data
          </span>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "30px",
            right: "40px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            background: "rgba(16, 185, 129, 0.1)",
            borderRadius: "8px",
            border: "1px solid rgba(16, 185, 129, 0.3)",
          }}
        >
          <span style={{ color: "#34d399", fontSize: "16px", fontWeight: 600 }}>
            Free Calculator
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
