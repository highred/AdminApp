
import React from 'react';
import { RequestStatus, WorkRequest } from '../../types';
import KanbanColumn from './KanbanColumn';
import { REQUEST_PRIORITY_ORDER } from '../../constants';

interface KanbanBoardProps {
    requests: WorkRequest[];
    onDeleteRequest: (requestId: number) => void;
    onStatusChange: (requestId: number, newStatus: RequestStatus, oldStatus: RequestStatus) => void;
    sortBy: 'priority' | 'recent';
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ requests, onDeleteRequest, onStatusChange, sortBy }) => {

    const columns: RequestStatus[] = [
        RequestStatus.NewRequest,
        RequestStatus.InProgress,
        RequestStatus.OnHold,
        RequestStatus.Completed
    ];
    
    const onDrop = (requestId: number, newStatus: RequestStatus) => {
        const request = requests.find(r => r.id === requestId);
        if (request && request.status !== newStatus) {
            onStatusChange(requestId, newStatus, request.status);
        }
    };

    const getRequestsByStatus = (status: RequestStatus): WorkRequest[] => {
        const filtered = requests.filter(req => req.status === status);

        if (sortBy === 'priority') {
            return filtered.sort((a, b) => {
                const priorityComparison = REQUEST_PRIORITY_ORDER[b.priority] - REQUEST_PRIORITY_ORDER[a.priority];
                if (priorityComparison !== 0) {
                    return priorityComparison;
                }
                // Secondary sort by date for items with the same priority
                return new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime();
            });
        }
        
        // Default sort by 'recent'
        return filtered.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());
    };

    return (
        <div className="flex h-full space-x-4 overflow-x-auto p-2 -mx-2">
            {columns.map(status => (
                <KanbanColumn 
                    key={status} 
                    status={status}
                    requests={getRequestsByStatus(status)}
                    onDrop={onDrop}
                    onDeleteRequest={onDeleteRequest}
                />
            ))}
        </div>
    );
};

export default KanbanBoard;
