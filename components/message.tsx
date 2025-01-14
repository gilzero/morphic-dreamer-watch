/**
 * @fileoverview This file defines the BotMessage component,
 * which renders bot messages with Markdown, LaTeX, and code
 * block support. It also includes a preprocessing function
 * for LaTeX equations.
 * @filepath components/message.tsx
 */
'use client'

import { MemoizedReactMarkdown } from './ui/markdown'
import rehypeExternalLinks from 'rehype-external-links'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { CodeBlock } from './ui/codeblock'

/**
 * Renders a bot message with Markdown, LaTeX, and code
 * block support.
 *
 * @param {object} props - The component props.
 * @param {string} props.content - The message content.
 * @returns {JSX.Element} The rendered bot message.
 */
export function BotMessage({ content }: { content: string }) {
  // Check if the content contains LaTeX patterns
  const containsLaTeX = /\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/.test(
    content || ''
  )

  // Modify the content to render LaTeX equations if LaTeX
  // patterns are found
  const processedData = preprocessLaTeX(content || '')

  if (containsLaTeX) {
    return (
      <MemoizedReactMarkdown
        rehypePlugins={[
          [rehypeExternalLinks, { target: '_blank' }],
          [rehypeKatex]
        ]}
        remarkPlugins={[remarkGfm, remarkMath]}
        className="prose-sm prose-neutral prose-a:text-accent-foreground/50"
      >
        {processedData}
      </MemoizedReactMarkdown>
    )
  }

  return (
    <MemoizedReactMarkdown
      rehypePlugins={[[rehypeExternalLinks, { target: '_blank' }]]}
      remarkPlugins={[remarkGfm]}
      className="prose-sm prose-neutral prose-a:text-accent-foreground/50"
      components={{
        /**
         * Renders a code block with syntax highlighting.
         *
         * @param {object} props - The code block props.
         * @param {object} props.node - The AST node.
         * @param {boolean} props.inline - Whether the code is inline.
         * @param {string} props.className - The code block class.
         * @param {Array<string>} props.children - The code content.
         * @returns {JSX.Element} The rendered code block.
         */
        code({ node, inline, className, children, ...props }) {
          if (children.length) {
            if (children[0] == '▍') {
              return (
                <span className="mt-1 cursor-default animate-pulse">▍</span>
              )
            }

            children[0] = (children[0] as string).replace('`▍`', '▍')
          }

          const match = /language-(\w+)/.exec(className || '')

          if (inline) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          }

          return (
            <CodeBlock
              key={Math.random()}
              language={(match && match[1]) || ''}
              value={String(children).replace(/\n$/, '')}
              {...props}
            />
          )
        }
      }}
    >
      {content}
    </MemoizedReactMarkdown>
  )
}

/**
 * Preprocesses LaTeX equations to be rendered by KaTeX.
 *
 * @param {string} content - The message content.
 * @returns {string} The processed content with LaTeX
 *   equations.
 */
const preprocessLaTeX = (content: string) => {
  const blockProcessedContent = content.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (_, equation) => `$$${equation}$$`
  )
  const inlineProcessedContent = blockProcessedContent.replace(
    /\\\(([\s\S]*?)\\\)/g,
    (_, equation) => `$${equation}$`
  )
  return inlineProcessedContent
}
