/**
 * @fileoverview This file defines various types and interfaces
 * used throughout the application, including search results,
 * chat messages, and other data structures.
 * @filepath lib/types/index.ts
 */

/**
 * Represents the structure of search results.
 */
export type SearchResults = {
  /** An array of image search results. */
  images: SearchResultImage[];
  /** An array of text-based search results. */
  results: SearchResultItem[];
  /** The number of results returned. */
  number_of_results?: number;
  /** The query used for the search. */
  query: string;
};

/**
 * Represents a single image search result.
 * Can be a string (URL) or an object with URL and description.
 */
export type SearchResultImage =
  | string
  | {
      /** The URL of the image. */
      url: string;
      /** A description of the image. */
      description: string;
      /** The number of results returned. */
      number_of_results?: number;
    };

/**
 * Represents a single text-based search result item.
 */
export type SearchResultItem = {
  /** The title of the result. */
  title: string;
  /** The URL of the result. */
  url: string;
  /** The content of the result. */
  content: string;
};

/**
 * Represents a chat object.
 */
export interface Chat extends Record<string, any> {
  /** The ID of the chat. */
  id: string;
  /** The title of the chat. */
  title: string;
  /** The date the chat was created. */
  createdAt: Date;
  /** The ID of the user who created the chat. */
  userId: string;
  /** The path of the chat. */
  path: string;
  /** An array of messages in the chat. */
  messages: AIMessage[];
  /** The share path of the chat. */
  sharePath?: string;
}

/**
 * Represents a message in the chat.
 */
export type AIMessage = {
  /** The role of the message sender. */
  role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool';
  /** The content of the message. */
  content: string;
  /** The ID of the message. */
  id: string;
  /** The name of the message sender. */
  name?: string;
  /** The type of the message. */
  type?:
    | 'answer'
    | 'related'
    | 'skip'
    | 'inquiry'
    | 'input'
    | 'input_related'
    | 'tool'
    | 'followup'
    | 'end';
};
