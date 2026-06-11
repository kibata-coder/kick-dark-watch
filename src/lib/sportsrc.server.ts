// SportSRC free V1 API — no API key required, CORS enabled.
// Docs: https://sportsrc.org/docs
const API_BASE = "https://api.sportsrc.org/";

export async function callSportsrc(qs: string): Promise<any> {
  const res = await fetch(`${API_BASE}?${qs}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`SportSRC request failed (${res.status})`);
  }
  return res.json();
}