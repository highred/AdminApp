
import React from 'react';
import { WorkRequest } from '../../types';
import PriorityTag from '../shared/PriorityTag';
import { PencilIcon, TrashIcon, BuildingIcon, CalendarIcon, BookOpenIcon } from '../icons/Icons';
import { useAppContext } from '../../hooks/useAppContext';

interface KanbanCardProps {
    request: WorkRequest;
    onEdit: (request: WorkRequest) => void;
    onDelete: (requestId: number) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    isBeingDragged: boolean;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ request, onEdit, onDelete, onTouchStart, isBeingDragged }) => {
    const { getSchoolById, getProgramById, zoomLevel } = useAppContext();
    const school = request.schoolId ? getSchoolById(request.schoolId) : null;
    const program = request.programId ? getProgramById(request.programId) : null;

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('requestId', request.id.toString());
    };
    
    const getPaddingClass = () => {
        switch(zoomLevel) {
            case 'sm': return 'p-2';
            case 'lg': return 'p-4';
            default: return 'p-3';
        }
    };

    return (
        <div 
            draggable 
            onDragStart={handleDragStart}
            onTouchStart={onTouchStart}
            className={`relative bg-white dark:bg-gray-800 ${getPaddingClass()} rounded-lg shadow-md cursor-grab active:cursor-grabbing group transition-opacity ${isBeingDragged ? 'opacity-30' : ''}`}
        >
            <div className="absolute bottom-full mb-2 w-72 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg text-sm text-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 left-0">
                <h4 className="font-bold mb-1 text-gray-800 dark:text-white">Full Description</h4>
                <p className="whitespace-pre-wrap">{request.description}</p>
            </div>
            
            <div className="flex justify-between items-start gap-2">
                <p className="font-semibold text-gray-800 dark:text-white truncate pr-2 flex-grow">{request.description}</p>
                <div className="flex items-center space-x-2 flex-shrink-0">
                     <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                        <button onClick={() => onEdit(request)} className="text-gray-400 hover:text-primary dark:hover:text-indigo-400" aria-label="Edit request">
                            <PencilIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => onDelete(request.id)} className="text-gray-400 hover:text-red-500" aria-label="Delete request">
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                    <PriorityTag priority={request.priority} />
                </div>
            </div>
            
            <div className="mt-2 space-y-1">
                {program && (
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <BookOpenIcon className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                        <span className="truncate">{program.name}</span>
                    </div>
                )}
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <BuildingIcon className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{school?.name || 'No School'}</span>
                    {request.classroom && <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{request.classroom}</span>}
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400" />
                    <span className="truncate">Due: {request.dueDate || 'Unassigned'}</span>
                </div>
            </div>

            <div className="mt-3 flex justify-between items-center">
                <span className="text-xs text-gray-600 dark:text-gray-300">{request.requestorName}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{request.submittedDate}</span>
            </div>
        </div>
    );
};

export default KanbanCard;
