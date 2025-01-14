/**
 * @fileoverview This file defines the schema for inquiries, including
 * the structure and constraints for questions, options, and input
 * fields.
 * 
 * @filepath lib/schema/inquiry.tsx
 */

import { DeepPartial } from 'ai';
import { z } from 'zod';

/**
 * Defines the schema for an inquiry.
 * 
 * @property {string} question - The inquiry question.
 * @property {Array} options - An array of objects, each containing a
 * value and label for the inquiry options.
 * @property {boolean} allowsInput - Indicates whether the inquiry
 * allows for input.
 * @property {string} [inputLabel] - The label for the input field.
 * @property {string} [inputPlaceholder] - The placeholder for the
 * input field.
 */
export const inquirySchema = z.object({
  question: z.string().describe('The inquiry question'),
  options: z
    .array(
      z.object({
        value: z.string(),
        label: z.string()
      })
    )
    .describe('The inquiry options'),
  allowsInput: z.boolean().describe('Whether the inquiry allows for input'),
  inputLabel: z.string().optional().describe('The label for the input field'),
  inputPlaceholder: z
    .string()
    .optional()
    .describe('The placeholder for the input field')
});

/**
 * Represents a partial version of the inquiry schema, allowing for
 * partial updates or queries.
 */
export type PartialInquiry = DeepPartial<typeof inquirySchema>;
