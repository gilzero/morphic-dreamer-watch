/**
 * @fileoverview This file defines the schema for retrieve operations,
 * including the URL to be retrieved.
 * 
 * @filepath lib/schema/retrieve.tsx
 */

import { DeepPartial } from 'ai'
import { z } from 'zod'

/**
 * Defines the schema for a retrieve operation.
 * 
 * @property {string} url - The URL to retrieve.
 */
export const retrieveSchema = z.object({
  url: z.string().describe('The url to retrieve')
})

/**
 * Represents a partial version of the retrieve schema, allowing for
 * partial updates or queries.
 */
export type PartialInquiry = DeepPartial<typeof retrieveSchema>
