/**
 * @fileoverview This file defines the AnswerSection component, which
 * displays a bot's response, handling streaming data and loading states.
 * @filepath components/answer-section.tsx
 */
'use client'

import { Section } from './section'
import { StreamableValue, useStreamableValue } from 'ai/rsc'
import { BotMessage } from './message'
import { useEffect, useState } from 'react'
import { DefaultSkeleton } from './default-skeleton'

/**
 * Defines the props for the AnswerSection component.
 */
export type AnswerSectionProps = {
  /** The streamable value containing the bot's response. */
  result?: StreamableValue<string>
  /** Whether to display a header for the section. */
  hasHeader?: boolean
}

/**
 * Renders a section displaying the bot's answer.
 * Handles streaming data and loading states.
 *
 * @param {AnswerSectionProps} props - The props for the component.
 * @returns {JSX.Element} The rendered AnswerSection component.
 */
export function AnswerSection({
  result,
  hasHeader = true
}: AnswerSectionProps) {
  const [data, error, pending] = useStreamableValue(result)
  const [content, setContent] = useState<string>('')

  useEffect(() => {
    if (!data) return
    setContent(data)
  }, [data])

  return (
    <div>
      {content.length > 0 ? (
        <Section title={hasHeader ? 'Answer' : undefined}>
          <BotMessage content={content} />
        </Section>
      ) : (
        <DefaultSkeleton />
      )}
    </div>
  )
}
