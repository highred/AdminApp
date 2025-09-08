import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import GridLayout from 'react-grid-layout';
import { useAppContext } from '../../hooks/useAppContext';
import useMediaQuery from '../../hooks/useMediaQuery';
import ProgramCard from '../dashboard/ProgramCard';
import AnalyticsWidget from '../dashboard/AnalyticsWidget';
import { PlusIcon, SaveIcon, FireIcon, ClipboardListIcon } from '../icons/Icons';
import { RequestStatus } from '../../types';

const Dashboard: React.FC = () => {
  const { programs, workRequests, openWorkRequestModal } = useAppContext();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [currentLayout, setCurrentLayout] = useState<GridLayout.Layout[]>([]);
  const [savedLayout, setSavedLayout] = useState<GridLayout.Layout[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLayoutInitialized, setIsLayoutInitialized] = useState(false);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [gridWidth, setGridWidth] = useState(1200);
  
  const motivationalQuotes = [
    "The secret of getting ahead is getting started.",
    "Well done is better than well said.",
    "You are what you repeatedly do. Excellence, then, is not an act, but a habit.",
    "The only way to do great work is to love what you do.",
    "Success is the sum of small efforts, repeated day in and day out.",
    "Either you run the day, or the day runs you.",
    "Believe you can and you're halfway there.",
    "The future depends on what you do today.",
    "Don't watch the clock; do what it does. Keep going.",
    "Act as if what you do makes a difference. It does.",
    "The journey of a thousand miles begins with a single step.",
    "Focus on being productive instead of busy."
  ];
  
  const dailyQuote = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return motivationalQuotes[dayOfYear % motivationalQuotes.length];
  }, []);

  const kpiData = useMemo(() => {
    const today = new Date();
    const completedRequests = workRequests.filter(req => req.status === RequestStatus.Completed);

    const completedAllTime = completedRequests.length;

    const completedLast7Days = completedRequests.filter(req => {
        const refDateStr = req.dueDate || req.submittedDate;
        if (!refDateStr) return false;
        // Adjust for timezone by treating date string as UTC
        const refDate = new Date(`${refDateStr}T00:00:00`);
        const diffTime = today.getTime() - refDate.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
    }).length;

    const completedLast30Days = completedRequests.filter(req => {
        const refDateStr = req.dueDate || req.submittedDate;
        if (!refDateStr) return false;
        const refDate = new Date(`${refDateStr}T00:00:00`);
        const diffTime = today.getTime() - refDate.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 30;
    }).length;

    return { completedAllTime, completedLast7Days, completedLast30Days };
  }, [workRequests]);

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
      <div className="p-4 h-full flex flex-col items-center justify-center text-center bg-light-bg dark:bg-dark-bg overflow-y-auto">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Welcome, Admin!</h1>
          <p className="text-sm italic text-gray-500 dark:text-gray-400 mb-6 px-4">"{dailyQuote}"</p>
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
          
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 w-full max-w-xs mx-auto">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Completed Tasks</h2>
              <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white dark:bg-dark-card p-3 rounded-lg shadow-md">
                      <p className="text-2xl font-bold text-secondary">{kpiData.completedLast7Days}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Last 7 Days</p>
                  </div>
                  <div className="bg-white dark:bg-dark-card p-3 rounded-lg shadow-md">
                      <p className="text-2xl font-bold text-secondary">{kpiData.completedLast30Days}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Last 30 Days</p>
                  </div>
                  <div className="bg-white dark:bg-dark-card p-3 rounded-lg shadow-md">
                      <p className="text-2xl font-bold text-secondary">{kpiData.completedAllTime}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">All Time</p>
                  </div>
              </div>
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