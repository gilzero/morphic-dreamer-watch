/**
 * @fileoverview This file defines the CollapsibleMessage component, which
 * renders a message that can be collapsed or expanded. It uses Radix UI
 * for the collapsible functionality and supports streaming boolean values
 * to control the collapsed state.
 * @filepath components/collapsible-message.tsx
 */
'use client'

import React, { useEffect, useState } from 'react'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent
} from '@radix-ui/react-collapsible'
import { Button } from './ui/button'
import { ChevronDown } from 'lucide-react'
import { StreamableValue, useStreamableValue } from 'ai/rsc'
import { cn } from '@/lib/utils'
import { Separator } from './ui/separator'

/**
 * Defines the props for the CollapsibleMessage component.
 */
interface CollapsibleMessageProps {
  /**
   * The message object containing the message id, a streamable boolean
   * indicating if the message is collapsed, and the message component.
   */
  message: {
    id: string
    isCollapsed?: StreamableValue<boolean>
    component: React.ReactNode
  }
  /**
   * Indicates if this is the last message in a list.
   */
  isLastMessage?: boolean
}

/**
 * A component that renders a message that can be collapsed or expanded.
 *
 * @param {CollapsibleMessageProps} props - The props for the component.
 * @returns {React.ReactNode} The rendered component.
 */
export const CollapsibleMessage: React.FC<CollapsibleMessageProps> = ({
  message,
  isLastMessage = false
}) => {
  const [data] = useStreamableValue(message.isCollapsed)
  const isCollapsed = data ?? false
  const [open, setOpen] = useState(isLastMessage)

  useEffect(() => {
    setOpen(isLastMessage)
  }, [isCollapsed, isLastMessage])

  // if not collapsed, return the component
  if (!isCollapsed) {
    return message.component
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={value => {
        setOpen(value)
      }}
    >
      <CollapsibleTrigger asChild>
        <div
          className={cn(
            'w-full flex justify-end',
            !isCollapsed ? 'hidden' : ''
          )}
        >
          <Button
            variant="ghost"
            size={'icon'}
            className={cn('-mt-3 rounded-full')}
          >
            <ChevronDown
              size={14}
              className={cn(
                open ? 'rotate-180' : 'rotate-0',
                'h-4 w-4 transition-all'
              )}
            />
            <span className="sr-only">collapse</span>
          </Button>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>{message.component}</CollapsibleContent>
      {!open && <Separator className="my-2 bg-muted" />}
    </Collapsible>
  )
}
