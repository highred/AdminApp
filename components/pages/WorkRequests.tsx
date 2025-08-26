
import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import KanbanBoard from '../work-requests/KanbanBoard';
import { PlusIcon } from '../icons/Icons';
import { WorkRequest, RequestStatus } from '../../types';
import WorkRequestList from '../work-requests/WorkRequestList';
import WorkRequestModal from '../work-requests/WorkRequestModal';
import { programToSlug } from '../../constants';

type ModalState = {
    isOpen: boolean;
    request: WorkRequest | null;
    mode: 'new' | 'edit' | 'update-status' | 'update-hold-status';
}

const WorkRequests: React.FC = () => {
    const [view, setView] = useState('kanban'); // 'kanban', 'list'
    const { workRequests, programs, deleteWorkRequest, updateWorkRequestStatus } = useAppContext();
    const [searchParams] = useSearchParams();
    const programSlug = searchParams.get('program');

    const [modalState, setModalState] = useState<ModalState>({ isOpen: false, request: null, mode: 'new' });

    const filteredRequests = useMemo(() => {
        if (!programSlug) return workRequests;
        const program = programs.find(p => programToSlug(p.name) === programSlug);
        if (!program) return workRequests;
        
        return workRequests.filter(req => req.programId === program.id);

    }, [programSlug, workRequests, programs]);

    const handleAddRequest = () => {
        setModalState({ isOpen: true, request: null, mode: 'new' });
    };
    
    const handleEditRequest = (request: WorkRequest) => {
        setModalState({ isOpen: true, request: request, mode: 'edit' });
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
            setModalState({ isOpen: true, request: requestToUpdate, mode: 'update-status' });
        } else if (newStatus === RequestStatus.OnHold) {
            setModalState({ isOpen: true, request: requestToUpdate, mode: 'update-hold-status' });
        } else {
            updateWorkRequestStatus(requestId, newStatus);
        }
    };
    
    const renderView = () => {
        const requestsToDisplay = programSlug ? filteredRequests : workRequests;
        switch (view) {
            case 'kanban':
                return <KanbanBoard requests={requestsToDisplay} onEditRequest={handleEditRequest} onDeleteRequest={handleDeleteRequest} onStatusChange={handleStatusChange} />;
            case 'list':
                return <WorkRequestList requests={requestsToDisplay} onEditRequest={handleEditRequest} onDeleteRequest={handleDeleteRequest} />;
            default:
                return <KanbanBoard requests={requestsToDisplay} onEditRequest={handleEditRequest} onDeleteRequest={handleDeleteRequest} onStatusChange={handleStatusChange} />;
        }
    };
    
    const getButtonClass = (buttonView: string) => 
        `px-4 py-2 rounded-md text-sm font-medium transition ${
            view === buttonView ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`;

    return (
        <div className="h-full flex flex-col">
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
                <div className="flex items-center space-x-2">
                    <button onClick={() => setView('kanban')} className={getButtonClass('kanban')}>Kanban</button>
                    <button onClick={() => setView('list')} className={getButtonClass('list')}>List</button>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                {renderView()}
            </div>
            <WorkRequestModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState(prev => ({...prev, isOpen: false}))}
                request={modalState.request}
                mode={modalState.mode}
            />
        </div>
    );
};

export default WorkRequests;