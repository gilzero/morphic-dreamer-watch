// lib/agents/tools/retrieve.tsx
import { tool } from 'ai';
import { retrieveSchema } from '@/lib/schema/retrieve';
import { ToolProps } from '.';
import { DefaultSkeleton } from '@/components/default-skeleton';
import { SearchResults as SearchResultsType } from '@/lib/types';
import RetrieveSection from '@/components/retrieve-section';

const CONTENT_CHARACTER_LIMIT = 10000;

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

export const retrieveTool = ({ uiStream, fullResponse }: ToolProps) =>
    tool({
      description: 'Retrieve content from a specific URL using Tavily',
      parameters: retrieveSchema,
      execute: async ({ url }) => {
        let errored = false;
        // Append the search section
        uiStream.update(<DefaultSkeleton />);

        let results: SearchResultsType | null = null;

        try {
          results = await fetchTavilyExtractData(url);
        } catch (error: any) {
          errored = true;
          fullResponse = `An error occurred while retrieving content from "${url}".`;
          if (error?.message) {
            fullResponse = `An error occurred while retrieving content from "${url}": ${error.message}`;
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