// lib/agents/tools/video-search.tsx
import { tool } from 'ai';
import { createStreamableValue } from 'ai/rsc';
import { searchSchema } from '@/lib/schema/search';
import { ToolProps } from '.';
import { VideoSearchSection } from '@/components/video-search-section';
import { SerperSearchResults } from '@/lib/types';

export const videoSearchTool = ({ uiStream, fullResponse }: ToolProps) =>
    tool({
      description: 'Search for videos on YouTube related to watches using Serper',
      parameters: searchSchema,
      execute: async ({ query }) => {
        let errored = false;
        // Append the search section
        const streamResults = createStreamableValue<string>();
        uiStream.append(<VideoSearchSection result={streamResults.value} />);

        let searchResult: SerperSearchResults | null = null;

        try {
          if (!process.env.SERPER_API_KEY) {
            throw new Error('SERPER_API_KEY is not set in the environment variables');
          }
          const response = await fetch('https://google.serper.dev/videos', {
            method: 'POST',
            headers: {
              'X-API-KEY': process.env.SERPER_API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ q: query }),
          });
          if (!response.ok) {
            throw new Error(
                `Serper API error: ${response.status} ${response.statusText}`
            );
          }
          searchResult = await response.json();
        } catch (error: any) {
          errored = true;
          fullResponse = `An error occurred while searching for videos with "${query}".`;
          if (error?.message) {
            fullResponse = `An error occurred while searching for videos with "${query}": ${error.message}`;
          }
          console.error('Video Search API error:', error);
        }

        if (errored || !searchResult) {
          uiStream.update(null);
          streamResults.done();
          return {
            searchParameters: { q: query, type: 'video', engine: 'google' },
            videos: [],
          };
        }

        streamResults.done(JSON.stringify(searchResult));
        return searchResult;
      },
    });