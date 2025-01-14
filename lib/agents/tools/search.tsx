/**
 * @fileoverview This file defines a tool for searching the web using
 * the Tavily API.
 * @filepath lib/agents/tools/search.tsx
 */
import { tool } from 'ai';
import { createStreamableValue } from 'ai/rsc';
import { searchSchema } from '@/lib/schema/search';
import { SearchSection } from '@/components/search-section';
import { ToolProps } from '.';
import { sanitizeUrl } from '@/lib/utils';
import { SearchResultImage, SearchResults } from '@/lib/types';

/**
 * Creates a search tool that uses the Tavily API.
 * @param {ToolProps} props - The properties for tool initialization.
 * @returns {any} A configured tool object.
 */
export const searchTool = ({ uiStream, fullResponse }: ToolProps) =>
  tool({
    description:
      'Search the web for information related to watches using Tavily',
    parameters: searchSchema,
    execute: async ({
      query,
      max_results,
      search_depth,
      include_domains,
      exclude_domains,
    }) => {
      let errored = false;
      const streamResults = createStreamableValue<string>();
      uiStream.append(
        <SearchSection
          result={streamResults.value}
          includeDomains={include_domains}
        />
      );

      const adjustedQuery =
        query.length < 5 ? query.padEnd(5, ' ') : query;

      if (max_results <= 0) {
        errored = true;
        fullResponse = `Invalid max_results value: ${max_results}. Must be a positive number.`;
        uiStream.update(null);
        streamResults.done();
        return {
          results: [],
          query: adjustedQuery,
          images: [],
          number_of_results: 0,
        };
      }

      let searchResult: SearchResults;
      try {
        searchResult = await tavilySearch(
          adjustedQuery,
          max_results,
          search_depth === 'advanced' ? 'advanced' : 'basic',
          include_domains,
          exclude_domains
        );
      } catch (error: any) {
        errored = true;
        if (error?.message) {
          fullResponse = `An error occurred while searching for "${adjustedQuery}": ${error.message}`;
        } else {
          fullResponse = `An error occurred while searching for "${adjustedQuery}".`;
        }
        searchResult = {
          results: [],
          query: adjustedQuery,
          images: [],
          number_of_results: 0,
        };
      }

      if (errored) {
        uiStream.update(null);
        streamResults.done();
        return searchResult;
      }

      streamResults.done(JSON.stringify(searchResult));
      return searchResult;
    },
  });

/**
 * Performs a search using the Tavily API.
 * @param {string} query - The search query.
 * @param {number} maxResults - The maximum number of results to return.
 * @param {'basic' | 'advanced'} searchDepth - The search depth.
 * @param {string[]} includeDomains - Domains to include in the search.
 * @param {string[]} excludeDomains - Domains to exclude from the search.
 * @returns {Promise<SearchResults>} A promise that resolves to the search results.
 * @throws {Error} If the Tavily API key is missing or if the API request fails.
 */
async function tavilySearch(
  query: string,
  maxResults: number = 10,
  searchDepth: 'basic' | 'advanced' = 'basic',
  includeDomains: string[] = [],
  excludeDomains: string[] = []
): Promise<SearchResults> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error('TAVILY_API_KEY is not set in the environment variables');
  }
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: Math.max(maxResults, 5),
      search_depth: searchDepth,
      include_images: true,
      include_image_descriptions: true,
      include_answers: true,
      include_domains: includeDomains,
      exclude_domains: excludeDomains,
    }),
  });
  if (!response.ok) {
    throw new Error(`Tavily API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  const processedImages = data.images
    .map(({ url, description }: { url: string; description: string }) => ({
      url: sanitizeUrl(url),
      description,
    }))
    .filter(
      (img: SearchResultImage): img is { url: string; description: string } =>
        typeof img === 'object' && img.description !== undefined
    );
  return { ...data, images: processedImages };
}