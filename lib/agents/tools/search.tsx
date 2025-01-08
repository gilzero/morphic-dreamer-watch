// lib/agents/tools/search.tsx
import { tool } from 'ai';
import { createStreamableValue } from 'ai/rsc';
import { searchSchema } from '@/lib/schema/search';
import { SearchSection } from '@/components/search-section';
import { ToolProps } from '.';
import { sanitizeUrl } from '@/lib/utils';
import { SearchResultImage, SearchResults } from '@/lib/types';

export const searchTool = ({ uiStream, fullResponse }: ToolProps) =>
    tool({
      description: 'Search the web for information related to watches using Tavily',
      parameters: searchSchema,
      execute: async ({
                        query,
                        max_results,
                        search_depth,
                        include_domains,
                        exclude_domains,
                      }) => {
        let hasError = false;
        // Append the search section
        const streamResults = createStreamableValue<string>();
        uiStream.append(
            <SearchSection
                result={streamResults.value}
                includeDomains={include_domains}
            />
        );

        // Tavily API requires a minimum of 5 characters in the query
        const filledQuery =
            query.length < 5 ? query + ' '.repeat(5 - query.length) : query;
        let searchResult: SearchResults;

        if (max_results <= 0) {
          hasError = true;
          fullResponse = `Invalid max_results value: ${max_results}. Must be a positive number.`;
          searchResult = {
            results: [],
            query: filledQuery,
            images: [],
            number_of_results: 0,
          };
          uiStream.update(null);
          streamResults.done();
          return searchResult;
        }

        try {
          searchResult = await tavilySearch(
              filledQuery,
              max_results,
              search_depth as 'basic' | 'advanced',
              include_domains,
              exclude_domains
          );
        } catch (error) {
          console.error('Tavily Search API error:', error);
          hasError = true;
          fullResponse = `An error occurred while searching for "${filledQuery}".`;
          if (error instanceof Error) {
            fullResponse = `An error occurred while searching for "${filledQuery}": ${error.message}`;
          }
          searchResult = {
            results: [],
            query: filledQuery,
            images: [],
            number_of_results: 0,
          };
        }

        if (hasError) {
          uiStream.update(null);
          streamResults.done();
          return searchResult;
        }

        streamResults.done(JSON.stringify(searchResult));
        return searchResult;
      },
    });

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
  const includeImageDescriptions = true;
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: Math.max(maxResults, 5),
      search_depth: searchDepth,
      include_images: true,
      include_image_descriptions: includeImageDescriptions,
      include_answers: true,
      include_domains: includeDomains,
      exclude_domains: excludeDomains,
    }),
  });

  if (!response.ok) {
    throw new Error(
        `Tavily API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  const processedImages = includeImageDescriptions
      ? data.images
          .map(({ url, description }: { url: string; description: string }) => ({
            url: sanitizeUrl(url),
            description,
          }))
          .filter(
              (
                  image: SearchResultImage
              ): image is { url: string; description: string } =>
                  typeof image === 'object' &&
                  image.description !== undefined &&
                  image.description !== ''
          )
      : data.images.map((url: string) => sanitizeUrl(url));

  return {
    ...data,
    images: processedImages,
  };
}