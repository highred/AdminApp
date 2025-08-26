import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import GridLayout from 'react-grid-layout';
import { useAppContext } from '../../hooks/useAppContext';
import useMediaQuery from '../../hooks/useMediaQuery';
import ProgramCard from '../dashboard/ProgramCard';
import WorkRequestModal from '../work-requests/WorkRequestModal';
import { PlusIcon, SaveIcon, FireIcon } from '../icons/Icons';

const Dashboard: React.FC = () => {
  const { programs } = useAppContext();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [currentLayout, setCurrentLayout] = useState<GridLayout.Layout[]>([]);
  const [savedLayout, setSavedLayout] = useState<GridLayout.Layout[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLayoutInitialized, setIsLayoutInitialized] = useState(false);

  const generateDefaultLayout = useCallback(() => {
    return programs.map((program, index) => ({
      i: program.id.toString(),
      x: (index % 2) * 6,
      y: Math.floor(index / 2) * 7,
      w: 6,
      h: 7,
    }));
  }, [programs]);

  useEffect(() => {
    // Initialize layout only once when programs are loaded
    if (programs.length > 0 && !isLayoutInitialized) {
      const storedLayout = localStorage.getItem('dashboardLayout-wide');
      let initialLayout;
      if (storedLayout) {
        initialLayout = JSON.parse(storedLayout);
      } else {
        initialLayout = generateDefaultLayout();
      }
      setCurrentLayout(initialLayout);
      setSavedLayout(initialLayout);
      setIsLayoutInitialized(true);
    }
  }, [programs, isLayoutInitialized, generateDefaultLayout]);

  useEffect(() => {
    // Detect if layout has changed from the saved state
    if (!isLayoutInitialized) return;
    const current = JSON.stringify(currentLayout);
    const saved = JSON.stringify(savedLayout);
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
      <div className="h-full flex flex-col items-center justify-center p-4 text-center bg-light-bg dark:bg-dark-bg">
        <div className="flex-grow flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Welcome, Admin!</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm">Ready to get things done? Add a new work request to get started.</p>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center w-full max-w-xs px-6 py-4 bg-primary text-white rounded-xl shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition text-lg font-semibold"
            >
                <PlusIcon className="h-6 w-6 mr-3" />
                Add New Work Request
            </button>
        </div>
        
        <div className="flex-shrink-0 w-full max-w-xs pb-4 text-center">
            <Link to="/hotlist" className="flex items-center justify-center w-full px-6 py-3 mb-3 bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold">
                <FireIcon className="h-5 w-5 mr-2 text-red-500" />
                View Daily Hotlist
            </Link>
            <Link to="/requests" className="text-gray-500 dark:text-gray-400 hover:underline text-sm font-medium">
                View All Work Requests &rarr;
            </Link>
        </div>
        
        <WorkRequestModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            request={null}
            mode={'new'}
        />
      </div>
    );
  }
  
  if (!isLayoutInitialized) {
    return null; // Render nothing until layout is ready to prevent flash of unstyled content
  }
  
  return (
      <div className="h-full flex flex-col">
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
          <div className="flex-1 overflow-y-auto">
              <GridLayout
                  className="layout"
                  layout={currentLayout}
                  cols={12}
                  rowHeight={50}
                  width={1200}
                  onLayoutChange={handleLayoutChange}
                  draggableHandle=".drag-handle"
              >
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