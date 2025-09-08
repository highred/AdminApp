import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RequestStatus, WorkRequest } from '../../types';
import KanbanColumn from './KanbanColumn';
import { REQUEST_PRIORITY_ORDER, VIRTUAL_STATUS_NEW_0_7_DAYS, VIRTUAL_STATUS_NEW_8_14_DAYS, VIRTUAL_STATUS_NEW_15_PLUS_DAYS } from '../../constants';

interface KanbanBoardProps {
    requests: WorkRequest[];
    onDeleteRequest: (requestId: number) => void;
    onStatusChange: (requestId: number, newStatus: RequestStatus, oldStatus: RequestStatus) => void;
    sortBy: 'priority' | 'recent';
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ requests, onDeleteRequest, onStatusChange, sortBy }) => {

    const columns: string[] = [
        VIRTUAL_STATUS_NEW_0_7_DAYS,
        VIRTUAL_STATUS_NEW_8_14_DAYS,
        VIRTUAL_STATUS_NEW_15_PLUS_DAYS,
        RequestStatus.InProgress,
        RequestStatus.OnHold,
        RequestStatus.Completed
    ];
    
    const onDrop = (requestId: number, newStatusString: string) => {
        const request = requests.find(r => r.id === requestId);
        
        // Map virtual statuses back to the real status for the update
        const isVirtualStatus = [VIRTUAL_STATUS_NEW_0_7_DAYS, VIRTUAL_STATUS_NEW_8_14_DAYS, VIRTUAL_STATUS_NEW_15_PLUS_DAYS].includes(newStatusString);
        
        const realNewStatus = isVirtualStatus ? RequestStatus.NewRequest : newStatusString as RequestStatus;

        if (request && request.status !== realNewStatus) {
            onStatusChange(requestId, realNewStatus, request.status);
        }
    };

    const getRequestsByStatus = (status: string): WorkRequest[] => {
        let filtered: WorkRequest[];
        const isVirtualStatus = [VIRTUAL_STATUS_NEW_0_7_DAYS, VIRTUAL_STATUS_NEW_8_14_DAYS, VIRTUAL_STATUS_NEW_15_PLUS_DAYS].includes(status);

        if (isVirtualStatus) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const newRequests = requests.filter(req => req.status === RequestStatus.NewRequest);

            filtered = newRequests.filter(req => {
                const submittedDate = new Date(`${req.submittedDate}T00:00:00`);
                const diffTime = today.getTime() - submittedDate.getTime();
                const diffDays = diffTime / (1000 * 60 * 60 * 24);

                if (status === VIRTUAL_STATUS_NEW_0_7_DAYS) {
                    return diffDays <= 7;
                }
                if (status === VIRTUAL_STATUS_NEW_8_14_DAYS) {
                    return diffDays > 7 && diffDays <= 14;
                }
                if (status === VIRTUAL_STATUS_NEW_15_PLUS_DAYS) {
                    return diffDays > 14;
                }
                return false;
            });
        } else {
            filtered = requests.filter(req => req.status === status);
        }

        if (sortBy === 'priority') {
            return filtered.sort((a, b) => {
                const priorityComparison = REQUEST_PRIORITY_ORDER[b.priority] - REQUEST_PRIORITY_ORDER[a.priority];
                if (priorityComparison !== 0) {
                    return priorityComparison;
                }
                return new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime();
            });
        }
        
        return filtered.sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());
    };

    // --- Touch Drag and Drop State and Logic ---
    const [draggedItem, setDraggedItem] = useState<{ id: number; ghost: HTMLElement; original: HTMLElement; } | null>(null);
    const [overColumn, setOverColumn] = useState<string | null>(null);
    const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const boardRef = useRef<HTMLDivElement>(null);


    const initiateMobileDrag = useCallback((cardElement: HTMLElement, request: WorkRequest) => {
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
        ghost.style.transition = 'none';
        document.body.appendChild(ghost);
        
        setDraggedItem({ id: request.id, ghost, original: cardElement });
        cardElement.style.opacity = '0.3';
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!draggedItem) return;
        e.preventDefault();
        const touch = e.touches[0];
        
        draggedItem.ghost.style.top = `${touch.clientY - (draggedItem.ghost.offsetHeight / 2)}px`;
        draggedItem.ghost.style.left = `${touch.clientX - (draggedItem.ghost.offsetWidth / 2)}px`;

        let foundOverColumn: string | null = null;
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
                    foundOverColumn = status;
                    break;
                }
            }
        }
        setOverColumn(foundOverColumn);

        if (boardRef.current) {
            const boardRect = boardRef.current.getBoundingClientRect();
            const scrollSpeed = 25;
            if(touch.clientX > boardRect.right - 50) {
                boardRef.current.scrollLeft += scrollSpeed;
            } else if (touch.clientX < boardRect.left + 50) {
                boardRef.current.scrollLeft -= scrollSpeed;
            }
        }

    }, [draggedItem]);

    const handleTouchEnd = useCallback(() => {
        if (!draggedItem) return;
        
        draggedItem.original.style.opacity = '1';
        document.body.removeChild(draggedItem.ghost);

        if (overColumn) {
            onDrop(draggedItem.id, overColumn);
        }

        setDraggedItem(null);
        setOverColumn(null);
    }, [draggedItem, overColumn, requests, onDrop]);

    useEffect(() => {
        if (draggedItem) {
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
                    ref={(el) => { columnRefs.current[status] = el; }}
                    key={status} 
                    status={status}
                    requests={getRequestsByStatus(status)}
                    onDrop={onDrop}
                    onDeleteRequest={onDeleteRequest}
                    onCardLongPressStart={initiateMobileDrag}
                    draggedItemId={draggedItem ? draggedItem.id : null}
                    isTouchOver={overColumn === status}
                />
            ))}
        </div>
    );
};

export default KanbanBoard;