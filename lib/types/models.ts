/**
 * @fileoverview This file defines the data structures for
 * available models and their providers.
 * @filepath lib/types/models.ts
 */

/**
 * Represents a model with its unique identifier, name,
 * provider, and provider-specific ID.
 */
export interface Model {
  /** Unique identifier for the model. */
  id: string;
  /** Human-readable name of the model. */
  name: string;
  /** Name of the model provider. */
  provider: string;
  /** Provider-specific identifier for the model. */
  providerId: string;
}

/**
 * An array of available models, each with its
 * corresponding details.
 */
export const models: Model[] = [
  // {
  //   id: 'claude-3-5-sonnet-latest',
  //   name: 'DreamerAI 3.5 Standard',
  //   provider: 'DreamerAI',
  //   providerId: 'anthropic',
  // },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'DreamerAI 3.5 Speedy',
    provider: 'DreamerAI',
    providerId: 'anthropic',
  },
  {
    id: 'gpt-4o-mini',
    name: 'DreamerAI 4 Mini',
    provider: 'DreamerAI',
    providerId: 'openai',
  },
  {
    id: 'gemini-2.0-flash-exp',
    name: 'DreamerAI Flash 2',
    provider: 'DreamerAI',
    providerId: 'google',
  },
  {
    id: 'sonar-pro',
    name: 'DreamerAI W Pro',
    provider: 'DreamerAI Pro',
    providerId: 'openai-compatible',
  },
  {
    id: 'sonar-reasoning-pro',
    name: 'DreamerAI W Reasoning Pro',
    provider: 'DreamerAI Pro',
    providerId: 'openai-compatible',
  },
];
