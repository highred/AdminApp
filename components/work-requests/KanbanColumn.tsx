import React, { useState } from 'react';
import { RequestStatus, WorkRequest } from '../../types';
import KanbanCard from './KanbanCard';
import { KANBAN_COLUMN_COLORS } from '../../constants';
import { useAppContext } from '../../hooks/useAppContext';
import WorkRequestModal from './WorkRequestModal';

interface KanbanColumnProps {
    status: RequestStatus;
    requests: WorkRequest[];
    onDrop: (requestId: number, newStatus: RequestStatus) => void;
    onDeleteRequest: (requestId: number) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, requests, onDrop, onDeleteRequest }) => {
    const [isOver, setIsOver] = useState(false);
    const { zoomLevel } = useAppContext();
    const [editingRequest, setEditingRequest] = useState<WorkRequest | null>(null);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = () => {
        setIsOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const requestId = parseInt(e.dataTransfer.getData('requestId'), 10);
        onDrop(requestId, status);
        setIsOver(false);
    };

    const colorClass = KANBAN_COLUMN_COLORS[status];
    
    const getWidthClass = () => {
        switch (zoomLevel) {
            case 'sm': return 'w-72';
            case 'lg': return 'w-96';
            default: return 'w-80';
        }
    };

    return (
        <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col flex-shrink-0 ${getWidthClass()} bg-gray-100 dark:bg-dark-card rounded-lg shadow-sm ${isOver ? 'bg-gray-200 dark:bg-gray-700' : ''} transition-all duration-300`}
        >
            <div className={`p-4 border-t-4 ${colorClass} rounded-t-lg flex-shrink-0`}>
                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center">
                    {status}
                    <span className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold px-2 py-1 rounded-full">{requests.length}</span>
                </h3>
            </div>
            <div className="flex-1 p-2 space-y-3 overflow-y-auto">
                {requests.map(request => (
                    <KanbanCard 
                        key={request.id} 
                        request={request}
                        onEdit={() => setEditingRequest(request)}
                        onDelete={onDeleteRequest}
                    />
                ))}
            </div>
            {editingRequest && (
                <WorkRequestModal
                    isOpen={!!editingRequest}
                    onClose={() => setEditingRequest(null)}
                    request={editingRequest}
                    mode={'edit'}
                />
            )}
        </div>
    );
};

export default KanbanColumn;