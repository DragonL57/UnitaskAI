export async function search(query: string) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error('Missing TAVILY_API_KEY');

  const payload = {
    api_key: apiKey,
    query,
    search_depth: 'smart',
    include_answer: true,
    include_images: false,
    include_raw_content: false,
    max_results: 5,
  };

  console.log('[Tavily] Searching with query:', query);

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('[Tavily] Error Response:', response.status, response.statusText);
      const errorBody = await response.text();
      console.error('[Tavily] Error Body:', errorBody);
      throw new Error(`Tavily search failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in Tavily search:', error);
    throw error;
  }
}

export async function readWebpage(url: string) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error('Missing TAVILY_API_KEY');

  console.log('[Tavily] Reading webpage:', url);

  try {
    const response = await fetch('https://api.tavily.com/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        urls: [url],
      }),
    });

    if (!response.ok) {
      console.error('[Tavily] Extract Error:', response.status);
      const errorBody = await response.text();
      console.error('[Tavily] Error Body:', errorBody);
      throw new Error(`Tavily extraction failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results?.[0]?.raw_content || 'No content found';
  } catch (error) {
    console.error('Error in Tavily extraction:', error);
    throw error;
  }
}