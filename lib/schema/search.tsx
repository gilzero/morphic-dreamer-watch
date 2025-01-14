/**
 * @fileoverview This file defines the schema for search operations,
 * including parameters for query, result limits, search depth, and
 * domain inclusion/exclusion.
 * 
 * @filepath lib/schema/search.tsx
 */

import { DeepPartial } from 'ai';
import { z } from 'zod';

/**
 * Defines the schema for a search operation.
 * 
 * @property {string} query - The query to search for.
 * @property {number} max_results - The maximum number of results to
 * return.
 * @property {string} search_depth - The depth of the search. Allowed
 * values are "basic" or "advanced".
 * @property {string[]} [include_domains] - A list of domains to
 * specifically include in the search results. Default is None, which
 * includes all domains.
 * @property {string[]} [exclude_domains] - A list of domains to
 * specifically exclude from the search results. Default is None, which
 * doesn't exclude any domains.
 */
export const searchSchema = z.object({
  query: z.string().describe('The query to search for'),
  max_results: z.coerce
    .number()
    .describe('The maximum number of results to return'),
  search_depth: z
    .string()
    .describe(
      'The depth of the search. Allowed values are "basic" or "advanced"'
    ),
  include_domains: z
    .array(z.string())
    .optional()
    .describe(
      'A list of domains to specifically include in the search results. Default is None, which includes all domains.'
    ),
  exclude_domains: z
    .array(z.string())
    .optional()
    .describe(
      "A list of domains to specifically exclude from the search results. Default is None, which doesn't exclude any domains."
    )
});

/**
 * Represents a partial version of the search schema, allowing for
 * partial updates or queries.
 */
export type PartialInquiry = DeepPartial<typeof searchSchema>;
