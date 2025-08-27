

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import KanbanBoard from '../work-requests/KanbanBoard';
import { PlusIcon } from '../icons/Icons';
import { WorkRequest, RequestStatus } from '../../types';
import WorkRequestList from '../work-requests/WorkRequestList';
import { programToSlug } from '../../constants';
import useMediaQuery from '../../hooks/useMediaQuery';

const WorkRequests: React.FC = () => {
    const [view, setView] = useState('kanban'); // 'kanban', 'list'
    const [kanbanSort, setKanbanSort] = useState<'priority' | 'recent'>('priority');
    const { workRequests, programs, deleteWorkRequest, updateWorkRequestStatus, openWorkRequestModal } = useAppContext();
    const [searchParams] = useSearchParams();
    const programSlug = searchParams.get('program');
    
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [mobileProgramFilter, setMobileProgramFilter] = useState<'All' | number>('All');

    const filteredRequests = useMemo(() => {
        if (isMobile) {
            if (mobileProgramFilter === 'All') {
                return workRequests;
            }
            return workRequests.filter(req => req.programId === mobileProgramFilter);
        }

        // Desktop logic
        if (!programSlug) return workRequests; // All Requests view
        const program = programs.find(p => programToSlug(p.name) === programSlug);
        if (!program) return []; // Return empty if slug is invalid
        
        return workRequests.filter(req => req.programId === program.id);

    }, [programSlug, workRequests, programs, isMobile, mobileProgramFilter]);

    const handleAddRequest = () => {
        openWorkRequestModal(null, 'new');
    };

    const handleDeleteRequest = (requestId: number) => {
        if (window.confirm('Are you sure you want to delete this work request?')) {
            deleteWorkRequest(requestId);
        }
    };

    const handleStatusChange = (requestId: number, newStatus: RequestStatus, oldStatus: RequestStatus) => {
        const requestToUpdate = workRequests.find(r => r.id === requestId);
        if (!requestToUpdate) return;
    
        if (oldStatus === RequestStatus.NewRequest && newStatus === RequestStatus.InProgress) {
            openWorkRequestModal(requestToUpdate, 'update-status');
        } else if (newStatus === RequestStatus.OnHold) {
            openWorkRequestModal(requestToUpdate, 'update-hold-status');
        } else {
            updateWorkRequestStatus(requestId, newStatus);
        }
    };
    
    const renderView = () => {
        switch (view) {
            case 'kanban':
                return <KanbanBoard requests={filteredRequests} onDeleteRequest={handleDeleteRequest} onStatusChange={handleStatusChange} sortBy={kanbanSort} />;
            case 'list':
                return <WorkRequestList requests={filteredRequests} onDeleteRequest={handleDeleteRequest} />;
            default:
                return <KanbanBoard requests={filteredRequests} onDeleteRequest={handleDeleteRequest} onStatusChange={handleStatusChange} sortBy={kanbanSort} />;
        }
    };
    
    const getButtonClass = (isActive: boolean) => 
        `px-3 py-1 rounded-md text-sm font-medium transition ${
            isActive 
                ? 'bg-white dark:bg-dark-card shadow-sm text-primary dark:text-white' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-dark-bg/50'
        }`;


    return (
        <div className="p-6 h-full flex flex-col">
            {isMobile && !programSlug && (
                <div className="mb-4">
                    <label htmlFor="program-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Filter by Program
                    </label>
                    <select
                        id="program-filter"
                        value={mobileProgramFilter}
                        onChange={(e) => setMobileProgramFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                        className="w-full px-4 py-2 bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="All">All Programs</option>
                        {programs.map(program => (
                            <option key={program.id} value={program.id}>{program.name}</option>
                        ))}
                    </select>
                </div>
            )}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className='flex items-center gap-4'>
                    <button 
                        onClick={handleAddRequest}
                        className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add New Request
                    </button>
                </div>
                <div className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                     {view === 'kanban' && (
                        <>
                            <button onClick={() => setKanbanSort('priority')} className={getButtonClass(kanbanSort === 'priority')}>Priority</button>
                            <button onClick={() => setKanbanSort('recent')} className={getButtonClass(kanbanSort === 'recent')}>Recent</button>
                            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                        </>
                    )}
                    <button onClick={() => setView('kanban')} className={getButtonClass(view === 'kanban')}>Kanban</button>
                    <button onClick={() => setView('list')} className={getButtonClass(view === 'list')}>List</button>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                {renderView()}
            </div>
        </div>
    );
};

export default WorkRequests;