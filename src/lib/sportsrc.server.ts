// src/lib/sportsrc.server.ts

const getApiBases = (useV2: boolean) => [
  useV2 ? "https://api.sportsrc.org/v2/" : "https://api.sportsrc.org/", 
  import.meta.env.VITE_SPORTSRC_BACKUP_API, 
].filter(Boolean); // Safely filters out undefined values

export async function callSportsrc(qs: string, useV2: boolean = true): Promise<any> {
  let lastError: Error | null = null;
  
  // 1. Force Vite to read the variable natively
  const apiKey = import.meta.env.VITE_SPORTSRC_API_KEY;

  // 2. Log a warning in your terminal if it fails to read the key
  if (!apiKey) {
    console.warn("⚠️ WARNING: VITE_SPORTSRC_API_KEY is missing! Falling back to free tier.");
  }

  // 3. Attach the key to the query parameter
  const queryWithKey = apiKey ? `${qs}&${useV2 ? 'api_key' : 'key'}=${apiKey}` : qs;

  for (const apiBase of getApiBases(useV2)) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); 

    try {
      const url = apiBase!.endsWith('/') ? `${apiBase}?${queryWithKey}` : `${apiBase}/?${queryWithKey}`;
      
      const res = await fetch(url, {
        headers: { 
          "Accept": "application/json",
          ...(apiKey ? { "x-api-key": apiKey, "Authorization": `Bearer ${apiKey}` } : {})
        },
        signal: controller.signal, 
      });

      clearTimeout(timeoutId); 

      if (res.status === 429) {
        throw new Error(`Rate limited (429) on endpoint: ${apiBase}`);
      }

      if (!res.ok) {
        throw new Error(`SportSRC request failed (${res.status}) on endpoint: ${apiBase}`);
      }
      
      return await res.json();

    } catch (error: any) {
      clearTimeout(timeoutId); 
      console.warn(`[SportSRC Failover Tracker] Request failed for ${apiBase}:`, error.message);
      lastError = error;
    }
  }

  throw new Error(`All configured SportSRC APIs failed execution. Final failure trace: ${lastError?.message}`);
}
