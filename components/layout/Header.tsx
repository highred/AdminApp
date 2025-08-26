import React, { useEffect } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { SearchIcon, ZoomInIcon, ZoomOutIcon } from '../icons/Icons';
import { useAppContext } from '../../hooks/useAppContext';
import { programToSlug } from '../../constants';
import { ZoomLevel } from '../../types';

const Header: React.FC = () => {
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const { getSchoolById, programs, zoomLevel, setZoomLevel, openSearch } = useAppContext();
  
  const zoomLevels: ZoomLevel[] = ['sm', 'md', 'lg'];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        openSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openSearch]);

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

  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/dashboard') return 'Programs Dashboard';
    if (path === '/chatbot') return 'AI Assistant';
    if (path === '/admin') return 'Admin Settings';
    if (path.startsWith('/requests')) {
        const programSlug = searchParams.get('program');
        if (programSlug) {
            const program = programs.find(p => programToSlug(p.name) === programSlug);
            return program ? `${program.name} - Work Requests` : 'Work Requests';
        }
        return 'Work Requests';
    }
    if (path.startsWith('/schools/')) {
        const school = params.schoolId ? getSchoolById(Number(params.schoolId)) : null;
        return school ? school.name : 'School Profile';
    }
    return 'Dashboard';
  };


  return (
    <header className="h-16 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white truncate">{getPageTitle()}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
            <button 
              onClick={handleZoomOut} 
              disabled={zoomLevel === 'sm'}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Zoom out"
            >
              <ZoomOutIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-6 text-center uppercase">{zoomLevel}</span>
            <button 
              onClick={handleZoomIn} 
              disabled={zoomLevel === 'lg'}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Zoom in"
            >
              <ZoomInIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
        </div>
        <div className="relative">
           <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
           <button
              onClick={openSearch}
              className="pl-10 pr-4 py-2 w-64 bg-gray-100 dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-left text-gray-500 dark:text-gray-400 flex justify-between items-center"
            >
              <span>Search...</span>
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-gray-600 rounded px-1.5 py-0.5">⌘K</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;