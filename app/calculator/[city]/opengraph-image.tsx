import { ImageResponse } from 'next/og';
import { getCityBySlug } from '@/lib/cities';

// Image dimensions for Open Graph
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Dynamic OG image generation
export default async function Image({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params;
  const cityData = getCityBySlug(slug);

  // Fallback if city not found
  const cityName = cityData?.city || 'Your City';
  const stateName = cityData?.state_name || '';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          position: 'relative',
        }}
      >
        {/* Background gradient overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
          }}
        />

        {/* Subtle grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        {/* Logo in top-left corner */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 50,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {/* Sun icon */}
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
          <span
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.02em',
            }}
          >
            SunScore
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '0 60px',
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 20px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 50,
              marginBottom: 24,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span style={{ color: '#10b981', fontSize: 18, fontWeight: 500 }}>
              {stateName}
            </span>
          </div>

          {/* Main headline */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 28,
                color: '#94a3b8',
                fontWeight: 500,
              }}
            >
              Solar Savings Calculator for
            </span>
            <span
              style={{
                fontSize: 72,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #10b981 0%, #22d3ee 100%)',
                backgroundClip: 'text',
                color: 'transparent',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              {cityName}
            </span>
          </div>

          {/* Subtext */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginTop: 32,
              padding: '12px 24px',
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              borderRadius: 12,
              border: '1px solid rgba(100, 116, 139, 0.2)',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5V19A9 3 0 0 0 21 19V5" />
              <path d="M3 12A9 3 0 0 0 21 12" />
            </svg>
            <span style={{ color: '#94a3b8', fontSize: 20, fontWeight: 500 }}>
              Official NREL® Data Analysis
            </span>
          </div>
        </div>

        {/* Bottom stats bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: 50,
            right: 50,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: 40 }}>
            {[
              { label: '25-Year Savings', icon: '💰' },
              { label: 'Instant Results', icon: '⚡' },
              { label: '100% Free', icon: '✓' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ color: '#64748b', fontSize: 16, fontWeight: 500 }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <span style={{ color: '#475569', fontSize: 16 }}>
            sunscore.io
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
