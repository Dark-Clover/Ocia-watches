/**
 * Approximate visitor location from the hosting platform's IP geolocation
 * headers (Vercel sets these on every request; no permission prompt, nothing
 * stored). Returns nulls locally or on hosts without geo headers — the client
 * then falls back to the browser's time zone.
 */
export async function GET(req: Request) {
  const h = req.headers;
  const decode = (v: string | null) => {
    if (!v) return null;
    try {
      return decodeURIComponent(v);
    } catch {
      return v;
    }
  };
  const num = (v: string | null) => (v !== null && Number.isFinite(Number(v)) ? Number(v) : null);

  return Response.json(
    {
      city: decode(h.get("x-vercel-ip-city")),
      country: h.get("x-vercel-ip-country"),
      latitude: num(h.get("x-vercel-ip-latitude")),
      longitude: num(h.get("x-vercel-ip-longitude")),
      timeZone: h.get("x-vercel-ip-timezone"),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
