/**
 * @fileoverview This file defines the schema for the next action,
 * including the possible actions that can be taken.
 * 
 * @filepath lib/schema/next-action.tsx
 */

import { DeepPartial } from 'ai'
import { z } from 'zod'

/**
 * Defines the schema for the next action.
 * 
 * @property {enum} next - The next action to take. Allowed values are
 * "inquire" or "proceed".
 */
export const nextActionSchema = z.object({
  next: z.enum(['inquire', 'proceed']).describe('The next action to take')
})

/**
 * Represents a partial version of the next action schema, allowing for
 * partial updates or queries.
 */
export type NextAction = DeepPartial<typeof nextActionSchema>
