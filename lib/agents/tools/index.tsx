/**
 * @fileoverview This file defines the tools available for AI agents,
 * including search and content retrieval functionalities.
 * @filepath lib/agents/tools/index.tsx
 */
import { createStreamableUI } from 'ai/rsc';
import { retrieveTool } from './retrieve';
import { searchTool } from './search';

/**
 * Defines the properties required for tool initialization.
 */
export interface ToolProps {
  /** Stream for updating the UI. */
  uiStream: ReturnType<typeof createStreamableUI>;
  /** Full response string for error handling. */
  fullResponse: string;
}

/**
 * Returns an object containing all available tools.
 * @param {ToolProps} props - The properties for tool initialization.
 * @returns {any} An object containing the search and retrieve tools.
 */
export const getTools = ({ uiStream, fullResponse }: ToolProps) => {
  const tools: any = {
    search: searchTool({
      uiStream,
      fullResponse,
    }),
    retrieve: retrieveTool({
      uiStream,
      fullResponse,
    }),
  };

  return tools;
};
