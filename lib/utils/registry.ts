/**
 * @fileoverview This file sets up and manages the provider registry
 * for different AI models, including OpenAI, Anthropic, Google,
 * Groq, and OpenAI-compatible models. It also provides utility
 * functions to retrieve models and check if a provider is enabled.
 * @filepath lib/utils/registry.ts
 */
import { experimental_createProviderRegistry as createProviderRegistry } from 'ai'
import { openai, createOpenAI } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'

/**
 * The registry of available AI providers.
 */
export const registry = createProviderRegistry({
  openai,
  anthropic,
  google,
  groq: createOpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
  }),
  'openai-compatible': createOpenAI({
    apiKey: process.env.OPENAI_COMPATIBLE_API_KEY,
    baseURL: process.env.OPENAI_COMPATIBLE_API_BASE_URL
  })
})

/**
 * Retrieves a language model from the registry.
 * @param {string} model - The ID of the model to retrieve.
 * @returns {any} The language model object.
 */
export function getModel(model: string) {
  return registry.languageModel(model)
}

/**
 * Checks if a provider is enabled based on environment variables.
 * @param {string} providerId - The ID of the provider to check.
 * @returns {boolean} True if the provider is enabled, false otherwise.
 */
export function isProviderEnabled(providerId: string): boolean {
  switch (providerId) {
    case 'openai':
      return !!process.env.OPENAI_API_KEY
    case 'anthropic':
      return !!process.env.ANTHROPIC_API_KEY
    case 'google':
      return !!process.env.GOOGLE_GENERATIVE_AI_API_KEY
    case 'groq':
      return !!process.env.GROQ_API_KEY
    case 'openai-compatible':
      return (
        !!process.env.OPENAI_COMPATIBLE_API_KEY &&
        !!process.env.OPENAI_COMPATIBLE_API_BASE_URL &&
        !!process.env.NEXT_PUBLIC_OPENAI_COMPATIBLE_MODEL
      )
    default:
      return false
  }
}
