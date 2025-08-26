
import React from 'react';
import { RequestStatus, WorkRequest } from '../../types';
import KanbanColumn from './KanbanColumn';

interface KanbanBoardProps {
    requests: WorkRequest[];
    onEditRequest: (request: WorkRequest) => void;
    onDeleteRequest: (requestId: number) => void;
    onStatusChange: (requestId: number, newStatus: RequestStatus, oldStatus: RequestStatus) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ requests, onEditRequest, onDeleteRequest, onStatusChange }) => {

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
        return requests.filter(req => req.status === status);
    };

    return (
        <div className="flex h-full space-x-4 overflow-x-auto p-2 -mx-2">
            {columns.map(status => (
                <KanbanColumn 
                    key={status} 
                    status={status}
                    requests={getRequestsByStatus(status)}
                    onDrop={onDrop}
                    onEditRequest={onEditRequest}
                    onDeleteRequest={onDeleteRequest}
                />
            ))}
        </div>
    );
};

export default KanbanBoard;