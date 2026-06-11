const API_BASE = "https://api.sportsrc.org/v2/";

let currentKeyIndex = 0;

export async function callSportsrc(qs: string): Promise<any> {
  const apiKeys = [
    process.env.SPORTSRC_API_KEY,
    process.env.SPORTSRC_API_KEY_SECONDARY,
  ].filter(Boolean) as string[];

  if (apiKeys.length === 0) {
    throw new Error("No SportSRC API keys are configured in environment variables");
  }

  if (currentKeyIndex >= apiKeys.length) currentKeyIndex = 0;
  let activeKey = apiKeys[currentKeyIndex];

  try {
    let res = await fetch(`${API_BASE}?${qs}`, {
      headers: { "X-API-KEY": activeKey },
    });

    if (res.status === 429 || !res.ok) {
      if (apiKeys.length > 1) {
        const nextIndex = (currentKeyIndex + 1) % apiKeys.length;
        console.warn(`SportSRC Key at index ${currentKeyIndex} failed (${res.status}). Rotating to ${nextIndex}...`);
        currentKeyIndex = nextIndex;
        activeKey = apiKeys[currentKeyIndex];
        res = await fetch(`${API_BASE}?${qs}`, {
          headers: { "X-API-KEY": activeKey },
        });
        if (!res.ok) {
          throw new Error(`SportSRC fallback request failed (${res.status})`);
        }
      } else {
        throw new Error(`SportSRC request failed (${res.status}) and no secondary key is configured.`);
      }
    }

    return res.json();
  } catch (error: any) {
    if (apiKeys.length > 1 && currentKeyIndex === 0) {
      console.warn("Primary key error, trying secondary...", error.message);
      currentKeyIndex = 1;
      activeKey = apiKeys[currentKeyIndex];
      const res = await fetch(`${API_BASE}?${qs}`, {
        headers: { "X-API-KEY": activeKey },
      });
      if (!res.ok) throw new Error(`SportSRC network fallback failed (${res.status})`);
      return res.json();
    }
    throw error;
  }
}