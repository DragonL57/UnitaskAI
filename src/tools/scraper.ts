/**
 * Unified Web Content Fetcher with multiple fallbacks.
 * Strategy: Tavily -> Direct Fetch -> Wayback Machine
 */

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Clean HTML content to plain text.
 */
function cleanHtml(html: string): string {
  return html
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, '')
    .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gmi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fetch from Wayback Machine as last resort.
 */
async function fetchFromWayback(url: string): Promise<string | null> {
  console.log('[Scraper] Wayback Machine: Checking availability for:', url);
  try {
    const availabilityRes = await fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(url)}`);
    if (!availabilityRes.ok) return null;
    
    const data = await availabilityRes.json();
    const closest = data.archived_snapshots?.closest;
    
    if (closest?.available && closest.url) {
      // Use id_ to get raw content without the archive.org banner
      const snapshotUrl = closest.url.replace(/\/web\/(\d+)\//, '/web/$1id_/');
      console.log('[Scraper] Wayback Machine: Fetching snapshot:', snapshotUrl);
      
      const contentRes = await fetch(snapshotUrl, { signal: AbortSignal.timeout(10000) });
      if (!contentRes.ok) return null;
      
      const html = await contentRes.text();
      return cleanHtml(html);
    }
  } catch (e) {
    console.error('[Scraper] Wayback Machine failed:', e);
  }
  return null;
}

/**
 * Direct fetch with browser-like headers.
 */
async function directFetch(url: string): Promise<string | null> {
  console.log('[Scraper] Direct Fetch: Attempting for:', url);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000)
    });

    if (response.ok) {
      const html = await response.text();
      return cleanHtml(html);
    }
    console.warn(`[Scraper] Direct Fetch returned status: ${response.status}`);
  } catch (e) {
    console.error('[Scraper] Direct Fetch failed:', e);
  }
  return null;
}

/**
 * Main entry point for reading a webpage with all fallbacks.
 */
export async function readWebpageWithFallback(url: string): Promise<string> {
  // We can't easily call Tavily from here if we want to avoid circular imports 
  // or keep concerns separate. We'll pass it or handle it in the agent.
  // Actually, I'll just implement the fallbacks here and the agent can try Tavily first.
  
  const direct = await directFetch(url);
  if (direct && direct.length > 200) return direct;

  const wayback = await fetchFromWayback(url);
  if (wayback && wayback.length > 200) return wayback;

  return 'Could not retrieve full webpage content. Please rely on search snippets.';
}
