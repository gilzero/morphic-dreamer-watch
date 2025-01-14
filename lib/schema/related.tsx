/**
 * @fileoverview This file defines the schema for related items,
 * including the structure and constraints for the items array.
 * 
 * @filepath lib/schema/related.tsx
 */

import { DeepPartial } from 'ai';
import { z } from 'zod';

/**
 * Defines the schema for related items.
 * 
 * @property {Array} items - An array of objects, each containing a
 * query string. The array must have exactly 3 items.
 */
export const relatedSchema = z.object({
  items: z
    .array(
      z.object({
        query: z.string().describe('The query string for the related item')
      })
    )
    .length(3)
    .describe('An array of 3 related items, each with a query string')
});

/**
 * Represents a partial version of the related schema, allowing for
 * partial updates or queries.
 */
export type PartialRelated = DeepPartial<typeof relatedSchema>;

/**
 * Represents the inferred type of the related schema.
 */
export type Related = z.infer<typeof relatedSchema>;
