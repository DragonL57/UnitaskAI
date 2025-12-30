const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function search(query: string) {
  const apiKey = process.env.BRAVE_API_KEY;
  if (!apiKey) {
    console.error('[Brave Search] Missing BRAVE_API_KEY');
    throw new Error('Missing BRAVE_API_KEY');
  }

  // Rate Limiting: Brave Free Tier allows ~1 request/second.
  // We wait 1.1s before every request to ensure we don't hit 429.
  await sleep(1100);

  console.log('[Brave Search] Searching with query:', query);

  try {
    const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey
      }
    });

    if (!response.ok) {
      console.error('[Brave Search] Error:', response.status, response.statusText);
      throw new Error(`Brave Search failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    interface BraveResult {
      title: string;
      url: string;
      description?: string;
      snippet?: string;
    }

    // Brave Search Response Structure (Simplified)
    // data.web.results -> Array of results
    const results: BraveResult[] = data.web?.results || [];

    if (results.length === 0) {
        console.log('[Brave Search] No results found.');
        return { results: [], no_results: true };
    }

    const mappedResults = results.map((r: BraveResult) => ({
      title: r.title,
      url: r.url,
      content: r.description || r.snippet || '', 
    }));

    return {
      results: mappedResults,
      no_results: false
    };

  } catch (error) {
    console.error('Error in Brave Search:', error);
    throw error;
  }
}
