import { NextResponse } from 'next/server';

// Allowed domains for API access
const ALLOWED_DOMAINS = [
  'sunscore.io',           // Production
  'sunscore-io.vercel.app', // Staging/Vercel
  'localhost:3000',        // Local Dev
];

export async function GET(request: Request) {
  // Security: Validate request origin to prevent unauthorized API usage
  const referer = request.headers.get('referer') || '';
  const origin = request.headers.get('origin') || '';

  const isAllowed = ALLOWED_DOMAINS.some(
    (domain) => referer.includes(domain) || origin.includes(domain)
  );

  if (!isAllowed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const API_KEY = process.env.NREL_API_KEY;

  if (!API_KEY) {
    return NextResponse.json({ error: 'NREL API key not configured' }, { status: 500 });
  }

  if (!lat || !lon) return NextResponse.json({ error: 'Missing coords' }, { status: 400 });

  try {
    const nrelUrl = `https://developer.nrel.gov/api/pvwatts/v8.json?api_key=${API_KEY}&lat=${lat}&lon=${lon}&system_capacity=6&azimuth=180&tilt=20&array_type=1&module_type=1&losses=14`;

    // Add timeout and retry logic
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const res = await fetch(nrelUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`NREL API error: ${res.status} ${res.statusText}`);
      throw new Error(`NREL API returned ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Solar API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Solar data unavailable: ${message}` }, { status: 500 });
  }
}
