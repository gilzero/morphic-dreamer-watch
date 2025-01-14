/**
 * @fileoverview This file defines the HistoryContainer component,
 * which conditionally renders the History component based on the
 * provided location prop.
 * @filepath components/history-container.tsx
 */
import React from 'react'
import { History } from './history'
import { HistoryList } from './history-list'

/**
 * Defines the props for the HistoryContainer component.
 */
type HistoryContainerProps = {
  /** The location where the history is displayed. */
  location: 'sidebar' | 'header'
}

/**
 * Renders the HistoryContainer component.
 *
 * This component conditionally renders the History component
 * based on the provided location prop. It uses a div to control
 * the display based on screen size.
 *
 * @param {HistoryContainerProps} props - The props for the
 *  component.
 * @returns {JSX.Element} The rendered component.
 */
const HistoryContainer: React.FC<HistoryContainerProps> = async ({
  location
}) => {
  return (
    <div
      className={location === 'header' ? 'block sm:hidden' :
        'hidden sm:block'}
    >
      <History location={location}>
        <HistoryList userId="anonymous" />
      </History>
    </div>
  )
}

export default HistoryContainer
