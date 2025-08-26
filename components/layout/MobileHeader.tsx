import React from 'react';
import { SchoolIcon } from '../icons/Icons';

const MobileHeader: React.FC = () => {
  return (
    <header className="h-16 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700 flex items-center justify-center px-4 flex-shrink-0">
      <div className="flex items-center">
        <SchoolIcon className="h-7 w-7 text-primary" />
        <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">Admin Hub</span>
      </div>
    </header>
  );
};

export default MobileHeader;
