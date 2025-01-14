/**
 * @fileoverview This file provides utility functions for the
 * application, including class name merging, message
 * transformation, URL sanitization, and model ID creation.
 * @filepath lib/utils/index.ts
 */
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { CoreMessage } from 'ai'
import { type Model } from '@/lib/types/models'

/**
 * Merges class names using clsx and tailwind-merge.
 * @param inputs - An array of class names.
 * @returns The merged class names.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Transforms tool messages to assistant messages.
 * Converts the content to a JSON string.
 * @param messages - Array of CoreMessage.
 * @returns Array of modified CoreMessage.
 */
export function transformToolMessages(
  messages: CoreMessage[]
): CoreMessage[] {
  return messages.map(message =>
    message.role === 'tool'
      ? {
          ...message,
          role: 'assistant',
          content: JSON.stringify(message.content),
          type: 'tool'
        }
      : message
  ) as CoreMessage[]
}

/**
 * Sanitizes a URL by replacing spaces with '%20'.
 * @param url - The URL to sanitize.
 * @returns The sanitized URL.
 */
export function sanitizeUrl(url: string): string {
  return url.replace(/\s+/g, '%20')
}

/**
 * Creates a model ID string from a Model object.
 * @param model - The Model object.
 * @returns The model ID string.
 */
export function createModelId(model: Model): string {
  return `${model.providerId}:${model.id}`
}

/**
 * Gets the default model ID from an array of models.
 * @param models - An array of Model objects.
 * @returns The default model ID string.
 * @throws Error if no models are available.
 */
export function getDefaultModelId(models: Model[]): string {
  if (!models.length) {
    throw new Error('No models available')
  }
  return createModelId(models[0])
}
