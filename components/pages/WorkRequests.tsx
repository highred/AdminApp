import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import KanbanBoard from '../work-requests/KanbanBoard';
import { PlusIcon, FilterIcon } from '../icons/Icons';
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
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

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
        if (!program) return workRequests; // FIX: Return all if slug is invalid
        
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
        <div className="p-4 md:p-6 h-full flex flex-col">
            {/* Header */}
            {isMobile ? (
                <div className="flex justify-between items-center mb-4 gap-2">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsFilterModalOpen(true)}
                            className="p-2 bg-white dark:bg-dark-card border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm"
                            aria-label="Filter by Program"
                        >
                            <FilterIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </button>
                        <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                            <button onClick={() => setKanbanSort('priority')} className={getButtonClass(kanbanSort === 'priority')}>Priority</button>
                            <button onClick={() => setKanbanSort('recent')} className={getButtonClass(kanbanSort === 'recent')}>Recent</button>
                        </div>
                    </div>
                     <button 
                        onClick={handleAddRequest}
                        className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                    >
                        <PlusIcon className="h-5 w-5 mr-1" />
                        New
                    </button>
                </div>
            ) : (
                <div className="flex flex-row justify-between items-center mb-6 gap-4">
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
            )}
            
            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {isMobile 
                    ? <KanbanBoard requests={filteredRequests} onDeleteRequest={handleDeleteRequest} onStatusChange={handleStatusChange} sortBy={kanbanSort} />
                    : renderView()
                }
            </div>

            {/* Mobile Filter Modal */}
            {isMobile && isFilterModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4" onClick={() => setIsFilterModalOpen(false)}>
                    <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold text-lg">Filter by Program</h3>
                        </div>
                        <ul className="p-2 max-h-64 overflow-y-auto">
                            <li>
                                <button onClick={() => { setMobileProgramFilter('All'); setIsFilterModalOpen(false); }} className={`w-full text-left p-3 rounded-md font-medium ${mobileProgramFilter === 'All' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                    All Programs
                                </button>
                            </li>
                            {programs.map(program => (
                                <li key={program.id}>
                                    <button onClick={() => { setMobileProgramFilter(program.id); setIsFilterModalOpen(false); }} className={`w-full text-left p-3 rounded-md ${mobileProgramFilter === program.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                        {program.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkRequests;