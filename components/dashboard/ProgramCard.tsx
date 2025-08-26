import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { RequestStatus, Program, WorkRequest } from '../../types';
import { ClipboardListIcon, SchoolIcon, BuildingIcon, PauseIcon } from '../icons/Icons';
import { programToSlug, REQUEST_PRIORITY_ORDER, REQUEST_PRIORITY_COLORS } from '../../constants';

interface ProgramCardProps {
    program: Program;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => {
    const { schools, workRequests, classrooms } = useAppContext();

    const programData = useMemo(() => {
        const schoolsInProgram = schools.filter(s => s.programId === program.id);
        const schoolIdsInProgram = new Set(schoolsInProgram.map(s => s.id));
        const totalClassrooms = classrooms.filter(c => schoolIdsInProgram.has(c.schoolId)).length;
        
        const programWorkRequests = workRequests.filter(req => req.programId === program.id);

        const openRequests = programWorkRequests.filter(req => req.status !== RequestStatus.Completed);
        const onHoldRequests = programWorkRequests.filter(req => req.status === RequestStatus.OnHold);

        return {
            schoolCount: schoolsInProgram.length,
            totalClassrooms,
            openRequestCount: openRequests.length,
            onHoldRequestCount: onHoldRequests.length,
        };
    }, [program.id, schools, workRequests, classrooms]);
    
    const topPriorities = useMemo(() => {
        const openRequests = workRequests.filter(req => 
            req.programId === program.id && req.status !== RequestStatus.Completed
        );

        const sortedRequests = [...openRequests].sort((a, b) => {
            // 1. Sort by Priority (descending)
            const priorityA = REQUEST_PRIORITY_ORDER[a.priority];
            const priorityB = REQUEST_PRIORITY_ORDER[b.priority];
            if (priorityA !== priorityB) {
                return priorityB - priorityA;
            }

            // 2. Sort by Due Date (ascending, with nulls considered last)
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;

            if (dateA !== dateB) {
                return dateA - dateB;
            }

            // Fallback sort by submission date to maintain a stable order
            return new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime();
        });
        
        return sortedRequests.slice(0, 3);
    }, [program.id, workRequests]);


    return (
        <Link to={`/requests?program=${programToSlug(program.name)}`} className="bg-white dark:bg-dark-card rounded-xl shadow-md overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex">
            <style>{`.line-clamp-2 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }`}</style>
            <div className="p-6 flex flex-col h-full w-full">
                <h2 className="text-xl font-bold text-primary dark:text-indigo-400">{program.name}</h2>
                
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-gray-600 dark:text-gray-300">
                    <div className="flex items-center">
                        <SchoolIcon className="h-5 w-5 mr-3 text-secondary" />
                        <span className="truncate">{programData.schoolCount} {programData.schoolCount === 1 ? 'School' : 'Schools'}</span>
                    </div>
                    <div className="flex items-center">
                        <ClipboardListIcon className="h-5 w-5 mr-3 text-yellow-500" />
                        <span className="truncate">{programData.openRequestCount} Open</span>
                    </div>
                    <div className="flex items-center">
                        <BuildingIcon className="h-5 w-5 mr-3 text-indigo-500" />
                        <span className="truncate">{programData.totalClassrooms} Classrooms</span>
                    </div>
                    <div className="flex items-center">
                        <PauseIcon className="h-5 w-5 mr-3 text-gray-500" />
                        <span className="truncate">{programData.onHoldRequestCount} On Hold</span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex-1 flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex-shrink-0">Top Priorities</h3>
                    <div className="flex-1">
                        {topPriorities.length > 0 ? (
                            <ul className="space-y-2">
                                {topPriorities.map(req => (
                                    <li key={req.id} className="text-xs text-gray-600 dark:text-gray-400">
                                        <div className="flex items-start" title={req.description}>
                                            <span className={`w-2 h-2 rounded-full mr-2 mt-1 flex-shrink-0 ${REQUEST_PRIORITY_COLORS[req.priority]}`}></span>
                                            <span className="line-clamp-2">{req.description}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-xs text-gray-500 dark:text-gray-400">No open requests to prioritize.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProgramCard;