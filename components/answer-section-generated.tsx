/**
 * @fileoverview This file defines the AnswerSectionGenerated
 * component, which displays a bot's answer within a section.
 * It uses the Section and BotMessage components for layout.
 * @filepath components/answer-section-generated.tsx
 */
'use client'

import { Section } from './section'
import { BotMessage } from './message'

/**
 * Props for the AnswerSectionGenerated component.
 */
export type AnswerSectionProps = {
  /** The content of the bot's answer. */
  result: string
}

/**
 * Displays a bot's answer within a styled section.
 *
 * @param {AnswerSectionProps} props - The props for the
 * component.
 * @returns {JSX.Element} A React element that displays the
 * answer.
 */
export function AnswerSectionGenerated({ result }: AnswerSectionProps) {
  return (
    <div>
      <Section title="Answer">
        <BotMessage content={result} />
      </Section>
    </div>
  )
}
