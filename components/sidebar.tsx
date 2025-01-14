/**
 * @fileoverview This file defines the Sidebar component, which
 * renders the sidebar containing the history container.
 * @filepath components/sidebar.tsx
 */
import HistoryContainer from './history-container';

/**
 * Renders the sidebar component.
 * @returns {JSX.Element} The sidebar element.
 */
export async function Sidebar() {
  return (
    <div className="h-screen p-2 fixed top-0 right-0 flex-col
      justify-center pb-16 hidden sm:flex">
      <HistoryContainer location="sidebar" />
    </div>
  );
}