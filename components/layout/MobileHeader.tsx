import React from 'react';
import { SchoolIcon, SearchIcon, ZoomInIcon, ZoomOutIcon } from '../icons/Icons';
import { useAppContext } from '../../hooks/useAppContext';
import type { ZoomLevel } from '../../types';

const MobileHeader: React.FC = () => {
  const { openSearch, zoomLevel, setZoomLevel } = useAppContext();
  const zoomLevels: ZoomLevel[] = ['sm', 'md', 'lg'];

  const handleZoomIn = () => {
    const currentIndex = zoomLevels.indexOf(zoomLevel);
    if (currentIndex < zoomLevels.length - 1) {
      setZoomLevel(zoomLevels[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = zoomLevels.indexOf(zoomLevel);
    if (currentIndex > 0) {
      setZoomLevel(zoomLevels[currentIndex - 1]);
    }
  };


  return (
    <header className="h-16 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center">
        <SchoolIcon className="h-7 w-7 text-primary" />
        <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">Admin Hub</span>
      </div>
      <div className="flex items-center space-x-2">
         <div className="flex items-center space-x-1 p-1 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
            <button 
              onClick={handleZoomOut} 
              disabled={zoomLevel === 'sm'}
              className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Zoom out"
            >
              <ZoomOutIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-6 text-center uppercase">{zoomLevel}</span>
            <button 
              onClick={handleZoomIn} 
              disabled={zoomLevel === 'lg'}
              className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Zoom in"
            >
              <ZoomInIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
        </div>
        <button 
          onClick={openSearch} 
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 w-10 h-10 flex items-center justify-center" 
          aria-label="Search"
        >
          <SearchIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    </header>
  );
};

export default MobileHeader;