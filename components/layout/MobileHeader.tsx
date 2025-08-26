import React from 'react';
import { SchoolIcon, SearchIcon } from '../icons/Icons';
import { useAppContext } from '../../hooks/useAppContext';

const MobileHeader: React.FC = () => {
  const { openSearch } = useAppContext();

  return (
    <header className="h-16 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 flex-shrink-0">
      <div className="w-10 h-10"></div> {/* Spacer to center the title */}
      <div className="flex items-center">
        <SchoolIcon className="h-7 w-7 text-primary" />
        <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">Admin Hub</span>
      </div>
      <button 
        onClick={openSearch} 
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 w-10 h-10 flex items-center justify-center" 
        aria-label="Search"
      >
        <SearchIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
      </button>
    </header>
  );
};

export default MobileHeader;
