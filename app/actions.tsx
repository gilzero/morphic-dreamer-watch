/**
 * @fileoverview This file defines the server actions and AI state
 * management for the application. It handles user input,
 * manages the AI workflow, and updates the UI state.
 * @filepath app/actions.tsx
 */
import {
  StreamableValue,
  createAI,
  createStreamableUI,
  createStreamableValue,
  getAIState,
  getMutableAIState
} from 'ai/rsc'
import { CoreMessage, generateId } from 'ai'
import { Section } from '@/components/section'
import { FollowupPanel } from '@/components/followup-panel'
import { saveChat } from '@/lib/actions/chat'
import { Chat } from '@/lib/types'
import { AIMessage } from '@/lib/types'
import { UserMessage } from '@/components/user-message'
import { SearchSection } from '@/components/search-section'
import SearchRelated from '@/components/search-related'
import { CopilotDisplay } from '@/components/copilot-display'
import RetrieveSection from '@/components/retrieve-section'
import { AnswerSection } from '@/components/answer-section'
import { workflow } from '@/lib/actions/workflow'
import { isProviderEnabled } from '@/lib/utils/registry'

const MAX_MESSAGES = 6

/**
 * Submits user input to the AI workflow.
 * @param {FormData} [formData] - The form data containing user input.
 * @param {boolean} [skip] - Whether to skip the user input.
 * @param {AIMessage[]} [retryMessages] - Messages to retry.
 * @returns {Promise<UIState>} The updated UI state.
 */
async function submit(
  formData?: FormData,
  skip?: boolean,
  retryMessages?: AIMessage[]
) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()
  const uiStream = createStreamableUI()
  const isGenerating = createStreamableValue(true)
  const isCollapsed = createStreamableValue(false)

  const aiMessages = [...(retryMessages ?? aiState.get().messages)]
  const messages: CoreMessage[] = aiMessages
    .filter(
      message =>
        message.role !== 'tool' &&
        message.type !== 'followup' &&
        message.type !== 'related' &&
        message.type !== 'end'
    )
    .map(message => {
      const { role, content } = message
      return { role, content } as CoreMessage
    })

  messages.splice(0, Math.max(messages.length - MAX_MESSAGES, 0))
  const userInput = skip
    ? `{"action": "skip"}`
    : (formData?.get('input') as string)

  const content = skip
    ? userInput
    : formData
    ? JSON.stringify(Object.fromEntries(formData))
    : null
  const type = skip
    ? undefined
    : formData?.has('input')
    ? 'input'
    : formData?.has('related_query')
    ? 'input_related'
    : 'inquiry'

  const model = (formData?.get('model') as string) || 'openai:gpt-4o-mini'
  const providerId = model.split(':')[0]
  console.log(`Using model: ${model}`)
  if (!isProviderEnabled(providerId)) {
    throw new Error(
      `Provider ${providerId} is not available (API key not configured or base URL not set)`
    )
  }

  if (content) {
    aiState.update({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages,
        {
          id: generateId(),
          role: 'user',
          content,
          type
        }
      ]
    })
    messages.push({
      role: 'user',
      content
    })
  }

  workflow(
    { uiStream, isCollapsed, isGenerating },
    aiState,
    messages,
    skip ?? false,
    model
  )

  return {
    id: generateId(),
    isGenerating: isGenerating.value,
    component: uiStream.value,
    isCollapsed: isCollapsed.value
  }
}

/**
 * Defines the structure of the AI state.
 * @typedef {object} AIState
 * @property {AIMessage[]} messages - The list of messages in the chat.
 * @property {string} chatId - The ID of the current chat.
 * @property {boolean} [isSharePage] - Whether the page is a share page.
 */
export type AIState = {
  messages: AIMessage[]
  chatId: string
  isSharePage?: boolean
}

/**
 * Defines the structure of the UI state.
 * @typedef {object} UIState
 * @property {string} id - The ID of the UI component.
 * @property {React.ReactNode} component - The UI component.
 * @property {StreamableValue<boolean>} [isGenerating] - Whether the component is generating.
 * @property {StreamableValue<boolean>} [isCollapsed] - Whether the component is collapsed.
 */
export type UIState = {
  id: string
  component: React.ReactNode
  isGenerating?: StreamableValue<boolean>
  isCollapsed?: StreamableValue<boolean>
}[]

const initialAIState: AIState = {
  chatId: generateId(),
  messages: []
}

const initialUIState: UIState = []

/**
 * AI is a provider you wrap your application with so you can access
 * AI and UI state in your components.
 */
export const AI = createAI<AIState, UIState>({
  actions: {
    submit
  },
  initialUIState,
  initialAIState,
  /**
   * Retrieves the UI state based on the current AI state.
   * @returns {Promise<UIState | undefined>} The UI state or undefined.
   */
  onGetUIState: async () => {
    'use server'

    const aiState = getAIState()
    if (aiState) {
      const uiState = getUIStateFromAIState(aiState as Chat)
      return uiState
    } else {
      return
    }
  },
  /**
   * Sets the AI state and saves the chat if an answer is present.
   * @param {object} params - The parameters for setting the AI state.
   * @param {AIState} params.state - The new AI state.
   * @param {Function} params.done - The done callback.
   * @returns {Promise<void>}
   */
  onSetAIState: async ({ state, done }) => {
    'use server'

    if (!state.messages.some(e => e.type === 'answer')) {
      return
    }

    const { chatId, messages } = state
    const createdAt = new Date()
    const userId = 'anonymous'
    const path = `/search/${chatId}`
    const title =
      messages.length > 0
        ? JSON.parse(messages[0].content)?.input?.substring(0, 100) ||
          'Untitled'
        : 'Untitled'
    const updatedMessages: AIMessage[] = [
      ...messages,
      {
        id: generateId(),
        role: 'assistant',
        content: `end`,
        type: 'end'
      }
    ]

    const chat: Chat = {
      id: chatId,
      createdAt,
      userId,
      path,
      title,
      messages: updatedMessages
    }
    await saveChat(chat)
  }
})

/**
 * Generates the UI state from the AI state.
 * @param {Chat} aiState - The current AI state.
 * @returns {UIState} The generated UI state.
 */
export const getUIStateFromAIState = (aiState: Chat) => {
  const chatId = aiState.chatId
  const isSharePage = aiState.isSharePage

  const messages = Array.isArray(aiState.messages)
    ? aiState.messages.map(msg => ({ ...msg }))
    : []

  return messages
    .map((message, index) => {
      const { role, content, id, type, name } = message

      if (
        !type ||
        type === 'end' ||
        (isSharePage && type === 'related') ||
        (isSharePage && type === 'followup')
      )
        return null

      switch (role) {
        case 'user':
          switch (type) {
            case 'input':
            case 'input_related':
              const json = JSON.parse(content)
              const value = type === 'input' ? json.input : json.related_query
              return {
                id,
                component: (
                  <UserMessage
                    message={value}
                    chatId={chatId}
                    showShare={index === 0 && !isSharePage}
                  />
                )
              }
            case 'inquiry':
              return {
                id,
                component: <CopilotDisplay content={content} />
              }
          }
        case 'assistant':
          const answer = createStreamableValue()
          answer.done(content)
          switch (type) {
            case 'answer':
              return {
                id,
                component: <AnswerSection result={answer.value} />
              }
            case 'related':
              const relatedQueries = createStreamableValue()
              relatedQueries.done(JSON.parse(content))
              return {
                id,
                component: (
                  <SearchRelated relatedQueries={relatedQueries.value} />
                )
              }
            case 'followup':
              return {
                id,
                component: (
                  <Section title="Follow-up" className="pb-8">
                    <FollowupPanel />
                  </Section>
                )
              }
          }
        case 'tool':
          try {
            const toolOutput = JSON.parse(content)
            const isCollapsed = createStreamableValue()
            isCollapsed.done(true)
            const searchResults = createStreamableValue()
            searchResults.done(JSON.stringify(toolOutput))
            switch (name) {
              case 'search':
                return {
                  id,
                  component: <SearchSection result={searchResults.value} />,
                  isCollapsed: isCollapsed.value
                }
              case 'retrieve':
                return {
                  id,
                  component: <RetrieveSection data={toolOutput} />,
                  isCollapsed: isCollapsed.value
                }
            }
          } catch (error) {
            return {
              id,
              component: null
            }
          }
        default:
          return {
            id,
            component: null
          }
      }
    })
    .filter(message => message !== null) as UIState
}
