export async function callTheSportsDB(endpoint: string): Promise<any> {
  const apiKey = '3'; // Free tier test key
  const baseUrl = `https://www.thesportsdb.com/api/v1/json/${apiKey}`;
  
  const url = `${baseUrl}/${endpoint}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`TheSportsDB request failed (${res.status}) on endpoint: ${endpoint}`);
    }

    const data = await res.json();
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error(`[TheSportsDB Client] Request failed:`, error.message);
    throw error;
  }
}
