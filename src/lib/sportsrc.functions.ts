import { createServerFn } from "@tanstack/react-start";

const API_BASE = "https://api.sportsrc.org/v2/";

// Tracks the current active key index globally across runtime requests on the server instance
let currentKeyIndex = 0;

async function callSportsrc(qs: string): Promise<any> {
  // Collect all keys configured in your system environment variables
  const apiKeys = [
    process.env.SPORTSRC_API_KEY,           // Primary Key Account
    process.env.SPORTSRC_API_KEY_SECONDARY, // Backup Secondary Key Account
  ].filter(Boolean) as string[];

  if (apiKeys.length === 0) {
    throw new Error("No SportSRC API keys are configured in environment variables");
  }

  // Ensure index boundary safety
  if (currentKeyIndex >= apiKeys.length) {
    currentKeyIndex = 0;
  }

  let activeKey = apiKeys[currentKeyIndex];

  try {
    let res = await fetch(`${API_BASE}?${qs}`, {
      headers: { "X-API-KEY": activeKey }, // Pass key via the recommended header method
    });

    // Detect if the current key hit a rate limit (429) or an un-authorized state
    if (res.status === 429 || !res.ok) {
      if (apiKeys.length > 1) {
        // Calculate the next key index to toggle to the backup account
        const nextIndex = (currentKeyIndex + 1) % apiKeys.length;
        console.warn(`SportSRC Key at index ${currentKeyIndex} exhausted or failed (${res.status}). Rotating to backup index ${nextIndex}...`);
        
        currentKeyIndex = nextIndex;
        activeKey = apiKeys[currentKeyIndex];

        // Instantly retry the exact same request with the secondary backup key
        res = await fetch(`${API_BASE}?${qs}`, {
          headers: { "X-API-KEY": activeKey },
        });

        if (!res.ok) {
          throw new Error(`SportSRC fallback request failed on the secondary key (${res.status})`);
        }
      } else {
        throw new Error(`SportSRC request failed (${res.status}) and no secondary key is configured.`);
      }
    }

    return res.json();
  } catch (error: any) {
    // Fail-open catcher: if a structural connection error occurred on the primary key, try the secondary
    if (apiKeys.length > 1 && currentKeyIndex === 0) {
      console.warn("Connection dropped on primary key, attempting emergency secondary routing fallback...", error.message);
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

export const getMatches = createServerFn({ method: "GET" })
  .inputValidator((data: { date: string; status?: string }) => data)
  .handler(async ({ data }) => {
    const status = data.status || "inprogress";
    return callSportsrc(
      `type=matches&sport=football&status=${encodeURIComponent(status)}&date=${encodeURIComponent(data.date)}`,
    );
  });

export const getMatchDetail = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return callSportsrc(`type=detail&id=${encodeURIComponent(data.id)}`);
  });
