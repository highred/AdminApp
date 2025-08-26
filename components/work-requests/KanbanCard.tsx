

import React from 'react';
import { WorkRequest } from '../../types';
import PriorityTag from '../shared/PriorityTag';
import { PencilIcon, TrashIcon, BuildingIcon, CalendarIcon, BookOpenIcon } from '../icons/Icons';
import { useAppContext } from '../../hooks/useAppContext';

interface KanbanCardProps {
    request: WorkRequest;
    // FIX: Changed onEdit prop to not expect any arguments, as the parent component (`KanbanColumn`) provides a handler with the `request` object already in its closure scope.
    onEdit: () => void;
    onDelete: (requestId: number) => void;
    onLongPressStart: (e: React.TouchEvent, request: WorkRequest) => void;
    isBeingDragged: boolean;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ request, onEdit, onDelete, onLongPressStart, isBeingDragged }) => {
    const { getSchoolById, getProgramById, zoomLevel } = useAppContext();
    const school = request.schoolId ? getSchoolById(request.schoolId) : null;
    const program = request.programId ? getProgramById(request.programId) : null;
    const longPressTimer = React.useRef<number>();
    const touchStartPos = React.useRef<{ x: number; y: number } | null>(null);

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
    
    const handleTouchStart = (e: React.TouchEvent) => {
        // Prevent drag from initiating on button clicks within the card
        if ((e.target as HTMLElement).closest('button')) {
            return;
        }
        
        touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        
        // Use a variable to hold the event reference for the timeout
        const eventForTimeout = e;
        
        longPressTimer.current = window.setTimeout(() => {
            onLongPressStart(eventForTimeout, request);
        }, 1000); // 1 second delay
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!touchStartPos.current) return;
        
        const moveX = Math.abs(e.touches[0].clientX - touchStartPos.current.x);
        const moveY = Math.abs(e.touches[0].clientY - touchStartPos.current.y);

        // If user moves more than 10px, it's a scroll, so cancel the long press
        if (moveX > 10 || moveY > 10) {
            clearTimeout(longPressTimer.current);
            touchStartPos.current = null;
        }
    };
    
    const handleTouchEnd = () => {
        clearTimeout(longPressTimer.current);
        touchStartPos.current = null;
    };


    return (
        <div 
            draggable 
            onDragStart={handleDragStart}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
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
                        {/* FIX: Changed onClick handler to directly use the onEdit prop, which is now of type () => void. */}
                        <button onClick={onEdit} className="text-gray-400 hover:text-primary dark:hover:text-indigo-400" aria-label="Edit request">
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
