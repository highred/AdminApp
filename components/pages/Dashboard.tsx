import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GridLayout from 'react-grid-layout';
import { useAppContext } from '../../hooks/useAppContext';
import useMediaQuery from '../../hooks/useMediaQuery';
import ProgramCard from '../dashboard/ProgramCard';
import WorkRequestModal from '../work-requests/WorkRequestModal';
import { PlusIcon } from '../icons/Icons';

const Dashboard: React.FC = () => {
  const { programs } = useAppContext();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [layout, setLayout] = useState<GridLayout.Layout[]>([]);
  const [isLayoutInitialized, setIsLayoutInitialized] = useState(false);

  useEffect(() => {
    const savedLayout = localStorage.getItem('dashboardLayout');
    if (savedLayout) {
        setLayout(JSON.parse(savedLayout));
    } else {
        // Generate a default layout if none is saved
        const defaultLayout = programs.map((program, index) => ({
            i: program.id.toString(),
            x: (index % 3) * 4,
            y: Math.floor(index / 3) * 5,
            w: 4,
            h: 5,
        }));
        setLayout(defaultLayout);
    }
    setIsLayoutInitialized(true);
  }, [programs]);

  const handleLayoutChange = (newLayout: GridLayout.Layout[]) => {
    // Check if layout has actually changed to avoid unnecessary saves
    if (JSON.stringify(newLayout) !== JSON.stringify(layout)) {
      localStorage.setItem('dashboardLayout', JSON.stringify(newLayout));
      setLayout(newLayout);
    }
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
        
        <Link to="/requests" className="mt-8 mb-4 text-primary dark:text-indigo-400 hover:underline font-medium">
            View All Work Requests &rarr;
        </Link>
        
        <WorkRequestModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            request={null}
            mode={'new'}
        />
      </div>
    );
  }
  
  // Render nothing until the layout has been initialized to prevent FOUC
  if (!isLayoutInitialized) {
    return null;
  }
  
  return (
      <div className="h-full overflow-y-auto">
          <GridLayout
              className="layout"
              layout={layout}
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
  );
};

export default Dashboard;