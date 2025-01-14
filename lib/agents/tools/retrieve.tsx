/**
 * @fileoverview This file defines a tool for retrieving content from a
 * specific URL using the Tavily API.
 * @filepath lib/agents/tools/retrieve.tsx
 */
import { tool } from 'ai';
import { retrieveSchema } from '@/lib/schema/retrieve';
import { ToolProps } from '.';
import { DefaultSkeleton } from '@/components/default-skeleton';
import { SearchResults as SearchResultsType } from '@/lib/types';
import RetrieveSection from '@/components/retrieve-section';

const CONTENT_CHARACTER_LIMIT = 10000;

/**
 * Fetches and extracts data from a given URL using the Tavily API.
 * @param {string} url - The URL to fetch content from.
 * @returns {Promise<SearchResultsType | null>} A promise that resolves to
 *  the extracted search results or null if an error occurs.
 * @throws {Error} If the Tavily API key is missing or if the API request
 *  fails.
 */
async function fetchTavilyExtractData(
  url: string
): Promise<SearchResultsType | null> {
  try {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      throw new Error('TAVILY_API_KEY is not set in the environment variables');
    }
    const response = await fetch('https://api.tavily.com/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ api_key: apiKey, urls: [url] }),
    });
    if (!response.ok) {
      throw new Error(
        `Tavily Extract API error: ${response.status} ${response.statusText}`
      );
    }
    const json = await response.json();
    if (!json.results || json.results.length === 0) {
      return null;
    }

    const result = json.results[0];
    const content = result.raw_content.slice(0, CONTENT_CHARACTER_LIMIT);

    return {
      results: [
        {
          title: content.slice(0, 100),
          content,
          url: result.url,
        },
      ],
      query: '',
      images: [],
    };
  } catch (error: any) {
    console.error('Tavily Extract API error:', error);
    throw new Error(
      `An error occurred while retrieving content from "${url}": ${
        error?.message || 'Unknown error'
      }`
    );
  }
}

/**
 * Defines a tool for retrieving content from a URL.
 * @param {ToolProps} props - The properties for the tool, including
 *  UI stream and full response.
 * @returns {any} A tool object with a description, parameters, and
 *  execute function.
 */
export const retrieveTool = ({ uiStream, fullResponse }: ToolProps) =>
  tool({
    description: 'Retrieve content from a specific URL using Tavily',
    parameters: retrieveSchema,
    /**
     * Executes the content retrieval process.
     * @param {{ url: string }} - An object containing the URL to retrieve.
     * @returns {Promise<SearchResultsType>} A promise that resolves to the
     *  search results or an empty result if an error occurs.
     */
    execute: async ({ url }) => {
      let errored = false;
      uiStream.update(<DefaultSkeleton />);

      let results: SearchResultsType | null = null;

      try {
        results = await fetchTavilyExtractData(url);
      } catch (error: any) {
        errored = true;
        fullResponse = `An error occurred while retrieving content from "${url}".`;
        if (error?.message) {
          fullResponse =
            `An error occurred while retrieving content from "${url}": ${error.message}`;
        }
        console.error('Error in retrieveTool:', error);
      }

      if (errored || !results) {
        uiStream.update(null);
        return {
          results: [],
          query: '',
          images: [],
        };
      }

      uiStream.update(<RetrieveSection data={results} />);

      return results;
    },
  });