export interface Model {
  id: string
  name: string
  provider: string
  providerId: string
}

export const models: Model[] = [
  {
    id: 'claude-3-5-sonnet-latest',
    name: 'DreamerAI 3.5 Standard',
    provider: 'DreamerAI',
    providerId: 'anthropic'
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'DreamerAI 3.5 Speedy',
    provider: 'DreamerAI',
    providerId: 'anthropic'
  },
  // {
  //   id: 'gpt-4o',
  //   name: 'GPT-4o',
  //   provider: 'OpenAI',
  //   providerId: 'openai'
  // },
  {
    id: 'gpt-4o-mini',
    name: 'DreamerAI 4 Mini',
    provider: 'DreamerAI',
    providerId: 'openai'
  },
  {
    id: 'gemini-2.0-flash-exp',
    name: 'DreamerAI Flash 2',
    provider: 'DreamerAI Pro',
    providerId: 'google'
  },
  // {
  //   id: 'llama3-groq-8b-8192-tool-use-preview',
  //   name: 'LLama 3 Groq 8B Tool Use',
  //   provider: 'Groq',
  //   providerId: 'groq'
  // },
  {
    id: process.env.NEXT_PUBLIC_OPENAI_COMPATIBLE_MODEL || 'undefined',
    name: 'DreamerAI Live W',
    provider: 'DreamerAI Pro',
    providerId: 'openai-compatible'
  }
]
