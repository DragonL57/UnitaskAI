import { search as ddgSearch, SafeSearchType } from 'duck-duck-scrape';

/**
 * Performs a web search using DuckDuckGo.
 * @param query The search query.
 * @returns An object containing search results.
 */
export async function search(query: string) {
  console.log('[DuckDuckGo] Searching with query:', query);

  try {
    const searchResults = await ddgSearch(query, {
      safeSearch: SafeSearchType.STRICT,
    });

    if (searchResults.noResults) {
      console.log('[DuckDuckGo] No results found for:', query);
      return {
        results: [],
        no_results: true,
      };
    }

    // Map to a consistent format similar to Tavily results if possible
    // Tavily results usually have { results: [{ title, url, content }] }
    const mappedResults = searchResults.results.map((r) => ({
      title: r.title,
      url: r.url,
      content: r.description, // duck-duck-scrape calls it description
    }));

    return {
      results: mappedResults,
      no_results: false,
    };
  } catch (error) {
    console.error('Error in DuckDuckGo search:', error);
    throw error;
  }
}
