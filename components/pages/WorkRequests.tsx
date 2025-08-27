
import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import KanbanBoard from '../work-requests/KanbanBoard';
import { PlusIcon } from '../icons/Icons';
import { WorkRequest, RequestStatus } from '../../types';
import WorkRequestList from '../work-requests/WorkRequestList';
import { programToSlug } from '../../constants';

const WorkRequests: React.FC = () => {
    const [view, setView] = useState('kanban'); // 'kanban', 'list'
    const [kanbanSort, setKanbanSort] = useState<'priority' | 'recent'>('priority');
    const { workRequests, programs, deleteWorkRequest, updateWorkRequestStatus, openWorkRequestModal } = useAppContext();
    const [searchParams] = useSearchParams();
    const programSlug = searchParams.get('program');

    const filteredRequests = useMemo(() => {
        if (!programSlug) return workRequests;
        const program = programs.find(p => programToSlug(p.name) === programSlug);
        if (!program) return workRequests;
        
        return workRequests.filter(req => req.programId === program.id);

    }, [programSlug, workRequests, programs]);

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
        const requestsToDisplay = programSlug ? filteredRequests : workRequests;
        switch (view) {
            case 'kanban':
                return <KanbanBoard requests={requestsToDisplay} onDeleteRequest={handleDeleteRequest} onStatusChange={handleStatusChange} sortBy={kanbanSort} />;
            case 'list':
                return <WorkRequestList requests={requestsToDisplay} onDeleteRequest={handleDeleteRequest} />;
            default:
                return <KanbanBoard requests={requestsToDisplay} onDeleteRequest={handleDeleteRequest} onStatusChange={handleStatusChange} sortBy={kanbanSort} />;
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