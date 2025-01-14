/**
 * @fileoverview This file defines the ToolBadge component,
 * which renders a badge with an icon and text.
 * It is used to display tools or features.
 */
/**
 * @filepath components/tool-badge.tsx
 */
import React from 'react'
import { Search } from 'lucide-react'
import { Badge } from './ui/badge'

/**
 * Defines the props for the ToolBadge component.
 */
type ToolBadgeProps = {
  /** The tool type, used to select the icon. */
  tool: string
  /** The content to display within the badge. */
  children: React.ReactNode
  /** Optional CSS class names for styling. */
  className?: string
}

/**
 * Renders a badge with an icon and text.
 * @param {ToolBadgeProps} props - The props for the component.
 * @returns {React.ReactElement} A badge element.
 */
export const ToolBadge: React.FC<ToolBadgeProps> = ({
  tool,
  children,
  className
}) => {
  /**
   * Maps tool names to their corresponding icons.
   */
  const icon: Record<string, React.ReactNode> = {
    search: <Search size={14} />
  }

  return (
    <Badge className={className} variant={'secondary'}>
      {icon[tool]}
      <span className="ml-1">{children}</span>
    </Badge>
  )
}
