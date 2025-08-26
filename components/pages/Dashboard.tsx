import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import useMediaQuery from '../../hooks/useMediaQuery';
import ProgramCard from '../dashboard/ProgramCard';
import WorkRequestModal from '../work-requests/WorkRequestModal';
import { PlusIcon } from '../icons/Icons';

const Dashboard: React.FC = () => {
  const { programs, zoomLevel } = useAppContext();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getGridCols = () => {
    switch (zoomLevel) {
      case 'sm': return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
      case 'lg': return 'grid-cols-1 md:grid-cols-2';
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
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
  
  return (
      <div className="space-y-6 h-full overflow-y-auto">
          <div className={`grid ${getGridCols()} gap-6`}>
              {programs.map(program => (
                  <ProgramCard key={program.id} program={program} />
              ))}
          </div>
      </div>
  );
};

export default Dashboard;