

import React, { useState, useRef, useEffect, useCallback } from 'react';
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

    // --- Touch Drag and Drop State and Logic ---
    const [draggedItem, setDraggedItem] = useState<{ id: number; ghost: HTMLElement; original: HTMLElement; } | null>(null);
    const [overColumn, setOverColumn] = useState<RequestStatus | null>(null);
    const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const boardRef = useRef<HTMLDivElement>(null);


    const handleTouchStart = useCallback((e: React.TouchEvent, request: WorkRequest) => {
        const cardElement = e.currentTarget as HTMLElement;

        // Create a ghost element for visual feedback
        const rect = cardElement.getBoundingClientRect();
        const ghost = cardElement.cloneNode(true) as HTMLElement;
        ghost.style.position = 'fixed';
        ghost.style.top = `${rect.top}px`;
        ghost.style.left = `${rect.left}px`;
        ghost.style.width = `${rect.width}px`;
        ghost.style.height = `${rect.height}px`;
        ghost.style.pointerEvents = 'none';
        ghost.style.zIndex = '1000';
        ghost.style.opacity = '0.8';
        ghost.style.transform = 'rotate(3deg) scale(1.05)';
        ghost.style.transition = 'none'; // So it moves instantly
        document.body.appendChild(ghost);
        
        // Update state
        setDraggedItem({ id: request.id, ghost, original: cardElement });
        cardElement.style.opacity = '0.3';
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!draggedItem) return;

        // Prevent scroll while dragging
        e.preventDefault();

        const touch = e.touches[0];
        
        // Move ghost element
        draggedItem.ghost.style.top = `${touch.clientY - (draggedItem.ghost.offsetHeight / 2)}px`;
        draggedItem.ghost.style.left = `${touch.clientX - (draggedItem.ghost.offsetWidth / 2)}px`;

        // Check for column overlap
        let foundOverColumn: RequestStatus | null = null;
        for (const status in columnRefs.current) {
            const columnEl = columnRefs.current[status];
            if (columnEl) {
                const rect = columnEl.getBoundingClientRect();
                if (
                    touch.clientX >= rect.left &&
                    touch.clientX <= rect.right &&
                    touch.clientY >= rect.top &&
                    touch.clientY <= rect.bottom
                ) {
                    foundOverColumn = status as RequestStatus;
                    break;
                }
            }
        }
        setOverColumn(foundOverColumn);

        // Auto-scroll kanban board
        if (boardRef.current) {
            const boardRect = boardRef.current.getBoundingClientRect();
            const scrollSpeed = 10;
            if(touch.clientX > boardRect.right - 50) {
                boardRef.current.scrollLeft += scrollSpeed;
            } else if (touch.clientX < boardRect.left + 50) {
                boardRef.current.scrollLeft -= scrollSpeed;
            }
        }

    }, [draggedItem]);

    const handleTouchEnd = useCallback(() => {
        if (!draggedItem) return;
        
        // Restore original card's opacity
        draggedItem.original.style.opacity = '1';

        // Cleanup ghost element
        document.body.removeChild(draggedItem.ghost);

        // Trigger drop logic
        const request = requests.find(r => r.id === draggedItem.id);
        if (overColumn && request && request.status !== overColumn) {
            onStatusChange(draggedItem.id, overColumn, request.status);
        }

        // Reset state
        setDraggedItem(null);
        setOverColumn(null);
    }, [draggedItem, overColumn, requests, onStatusChange]);

    useEffect(() => {
        if (draggedItem) {
            // Use passive: false to allow preventDefault
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
        } else {
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        }
        return () => {
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [draggedItem, handleTouchMove, handleTouchEnd]);

    return (
        <div ref={boardRef} className="flex h-full space-x-4 overflow-x-auto p-2 -mx-2">
            {columns.map(status => (
                <KanbanColumn 
                    // FIX: Changed the ref callback to have a block body, ensuring it returns void and satisfies the Ref<HTMLDivElement> type.
                    ref={el => { columnRefs.current[status] = el; }}
                    key={status} 
                    status={status}
                    requests={getRequestsByStatus(status)}
                    onDrop={onDrop}
                    onDeleteRequest={onDeleteRequest}
                    onCardTouchStart={handleTouchStart}
                    draggedItemId={draggedItem ? draggedItem.id : null}
                    isTouchOver={overColumn === status}
                />
            ))}
        </div>
    );
};

export default KanbanBoard;
