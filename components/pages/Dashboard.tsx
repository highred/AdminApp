import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import GridLayout from 'react-grid-layout';
import { useAppContext } from '../../hooks/useAppContext';
import useMediaQuery from '../../hooks/useMediaQuery';
import ProgramCard from '../dashboard/ProgramCard';
import AnalyticsWidget from '../dashboard/AnalyticsWidget';
import { PlusIcon, SaveIcon, FireIcon, ClipboardListIcon } from '../icons/Icons';

const Dashboard: React.FC = () => {
  const { programs, openWorkRequestModal } = useAppContext();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [currentLayout, setCurrentLayout] = useState<GridLayout.Layout[]>([]);
  const [savedLayout, setSavedLayout] = useState<GridLayout.Layout[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLayoutInitialized, setIsLayoutInitialized] = useState(false);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [gridWidth, setGridWidth] = useState(1200);

  useEffect(() => {
    // Only run on desktop
    if (isMobile) return;
    
    const gridEl = gridContainerRef.current;
    if (!gridEl) return;

    const resizeObserver = new ResizeObserver(entries => {
        if (entries[0] && entries[0].contentRect.width > 0) {
            setGridWidth(entries[0].contentRect.width);
        }
    });

    resizeObserver.observe(gridEl);
    
    if (gridEl.offsetWidth > 0) {
        setGridWidth(gridEl.offsetWidth);
    }

    return () => {
        resizeObserver.unobserve(gridEl);
    };
  }, [isMobile]);


  const generateDefaultLayout = useCallback(() => {
    const analyticsLayout = { i: 'analytics-widget', x: 0, y: 0, w: 12, h: 7 };
    const programLayouts = programs.map((program, index) => ({
      i: program.id.toString(),
      x: (index % 3) * 4,
      y: Math.floor(index / 3) * 7 + 7, // Offset by analytics widget height
      w: 4,
      h: 7,
    }));
    return [analyticsLayout, ...programLayouts];
  }, [programs]);

  useEffect(() => {
    if (programs.length > 0 && !isLayoutInitialized) {
      const storedLayoutJSON = localStorage.getItem('dashboardLayout-wide');
      let initialLayout: GridLayout.Layout[];

      if (storedLayoutJSON) {
        let storedLayout: GridLayout.Layout[] = JSON.parse(storedLayoutJSON);
        
        // Invalidate stored layout if it's the old 2-column format (w: 6) or if program items have changed.
        const hasOldLayout = storedLayout.some(item => item.i !== 'analytics-widget' && item.w === 6);
        
        const storedProgramItems = storedLayout.filter(item => item.i !== 'analytics-widget');
        const storedProgramIds = new Set(storedProgramItems.map(item => item.i));
        const currentProgramIds = new Set(programs.map(p => p.id.toString()));
        const programItemsMismatch = storedProgramItems.length !== programs.length || ![...currentProgramIds].every(id => storedProgramIds.has(id));

        if (hasOldLayout || programItemsMismatch) {
          initialLayout = generateDefaultLayout();
        } else {
          initialLayout = storedLayout;
        }
      } else {
        initialLayout = generateDefaultLayout();
      }
      
      setCurrentLayout(initialLayout);
      setSavedLayout(initialLayout);
      setIsLayoutInitialized(true);
    }
  }, [programs, isLayoutInitialized, generateDefaultLayout]);

  useEffect(() => {
    if (!isLayoutInitialized) return;
    const current = JSON.stringify(currentLayout.map(l => ({ i: l.i, x: l.x, y: l.y, w: l.w, h: l.h })));
    const saved = JSON.stringify(savedLayout.map(l => ({ i: l.i, x: l.x, y: l.y, w: l.w, h: l.h })));
    setHasUnsavedChanges(current !== saved);
  }, [currentLayout, savedLayout, isLayoutInitialized]);

  const handleLayoutChange = (newLayout: GridLayout.Layout[]) => {
    setCurrentLayout(newLayout);
  };
  
  const handleSaveLayout = () => {
    localStorage.setItem('dashboardLayout-wide', JSON.stringify(currentLayout));
    setSavedLayout(currentLayout);
  };


  if (isMobile) {
    return (
      <div className="p-4 h-full flex flex-col items-center justify-center text-center bg-light-bg dark:bg-dark-bg">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Welcome, Admin!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Ready to get things done? Add a new work request to get started.</p>
          
          <button 
              onClick={() => openWorkRequestModal(null, 'new')}
              className="flex items-center justify-center w-full px-6 py-4 bg-primary text-white rounded-xl shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition text-lg font-semibold mb-6"
          >
              <PlusIcon className="h-6 w-6 mr-3" />
              Add New Work Request
          </button>
        
          <div className="flex flex-col items-center justify-center w-full max-w-xs mx-auto">
              <Link to="/hotlist" className="flex items-center justify-center w-full px-6 py-3 bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold mb-3">
                  <FireIcon className="h-5 w-5 mr-2 text-red-500" />
                  View Daily Hotlist
              </Link>
              <Link to="/requests" className="flex items-center justify-center w-full px-6 py-3 bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold">
                  <ClipboardListIcon className="h-5 w-5 mr-2 text-primary" />
                  View All Work Requests
              </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (!isLayoutInitialized) {
    return null; // Render nothing until layout is ready to prevent flash of unstyled content
  }
  
  return (
      <div className="p-6 h-full flex flex-col">
        {hasUnsavedChanges && (
            <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900/50 border-b-2 border-yellow-300 dark:border-yellow-700 p-3 flex justify-between items-center mb-2 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    You have unsaved changes to your dashboard layout.
                </p>
                <button 
                    onClick={handleSaveLayout}
                    className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold shadow-sm transition-all"
                >
                    <SaveIcon className="h-4 w-4 mr-2" />
                    Save Layout
                </button>
            </div>
        )}
          <div className="flex-1 overflow-y-auto" ref={gridContainerRef}>
              <GridLayout
                  className="layout"
                  layout={currentLayout}
                  cols={12}
                  rowHeight={50}
                  width={gridWidth}
                  onLayoutChange={handleLayoutChange}
                  draggableHandle=".drag-handle"
              >
                  <div key="analytics-widget" className="bg-white dark:bg-dark-card rounded-xl shadow-md overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <AnalyticsWidget />
                  </div>
                  {programs.map(program => (
                      <div key={program.id.toString()} className="bg-white dark:bg-dark-card rounded-xl shadow-md overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <ProgramCard program={program} />
                      </div>
                  ))}
              </GridLayout>
          </div>
      </div>
  );
};

export default Dashboard;