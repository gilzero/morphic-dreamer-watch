import React from 'react'
import { ModeToggle } from './mode-toggle'
import { FaRegClock } from 'react-icons/fa'
import { cn } from '@/lib/utils'
import HistoryContainer from './history-container'

export const Header: React.FC = async () => {
  return (
    <header className="fixed w-full p-2 md:p-4 flex justify-between items-center z-10 backdrop-blur md:backdrop-blur-none bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
      <div>
        <a href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <FaRegClock className={cn('w-6 h-6 animate-spin')} />
          <span className="text-lg font-semibold">DreamerAI Watch Pro</span>
        </a>
      </div>
      <div className="flex gap-2">
        <ModeToggle />
        <HistoryContainer location="header" />
      </div>
    </header>
  )
}

export default Header
