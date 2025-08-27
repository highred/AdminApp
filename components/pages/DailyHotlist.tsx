import React, { useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { WorkRequest, RequestStatus } from '../../types';
import { REQUEST_PRIORITY_ORDER, REQUEST_STATUS_ORDER } from '../../constants';
import PriorityTag from '../shared/PriorityTag';
import { FireIcon, CalendarIcon, BuildingIcon, BookOpenIcon } from '../icons/Icons';

const DailyHotlist: React.FC = () => {
    const { workRequests, getSchoolById, getProgramById } = useAppContext();

    const hotlistItems = useMemo(() => {
        // 1. Filter out completed items
        const activeRequests = workRequests.filter(req =>
            req.status !== RequestStatus.Completed
        );

        // 2. Sort the requests
        const sortedRequests = activeRequests.sort((a, b) => {
            // Sort by Priority (Critical > High > Medium > Low)
            const priorityOrderA = REQUEST_PRIORITY_ORDER[a.priority];
            const priorityOrderB = REQUEST_PRIORITY_ORDER[b.priority];
            if (priorityOrderA !== priorityOrderB) {
                return priorityOrderB - priorityOrderA;
            }

            // Sort by Status (In Progress > New Request > On Hold)
            const statusOrderA = REQUEST_STATUS_ORDER[a.status];
            const statusOrderB = REQUEST_STATUS_ORDER[b.status];
            if (statusOrderA !== statusOrderB) {
                return statusOrderB - statusOrderA;
            }

            // Sort by Due Date (earlier dates first, nulls are last)
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
            if (dateA !== dateB) {
                return dateA - dateB;
            }
            
            // Fallback sort by submission date
            return new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime();
        });

        // 3. Take the top 20
        return sortedRequests.slice(0, 20);
    }, [workRequests]);

    return (
        <div className="h-full flex flex-col p-6">
            <div className="flex-shrink-0">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
                    <FireIcon className="h-8 w-8 mr-3 text-red-500" />
                    Daily Hotlist
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Your top 20 most critical tasks based on priority, status, and due date.</p>
            </div>

            <div className="flex-1 overflow-y-auto mt-6">
                {hotlistItems.length > 0 ? (
                    <ol className="space-y-4">
                        {hotlistItems.map((request, index) => {
                            const school = request.schoolId ? getSchoolById(request.schoolId) : null;
                            const program = request.programId ? getProgramById(request.programId) : null;
                            return (
                                <li key={request.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-dark-card rounded-lg transition-shadow hover:shadow-lg">
                                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white font-bold text-lg flex-shrink-0">{index + 1}</span>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="font-semibold text-gray-900 dark:text-white mb-1">{request.description}</p>
                                            <div className="ml-4 flex-shrink-0">
                                                <PriorityTag priority={request.priority} />
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mt-2">
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${request.status === RequestStatus.InProgress ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : request.status === RequestStatus.OnHold ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'}`}>{request.status}</span>
                                            {request.dueDate && (
                                                <div className="flex items-center">
                                                    <CalendarIcon className="h-4 w-4 mr-1.5" />
                                                    <span>Due: {request.dueDate}</span>
                                                </div>
                                            )}
                                            {program && (
                                                <div className="flex items-center">
                                                    <BookOpenIcon className="h-4 w-4 mr-1.5" />
                                                    <span>{program.name}</span>
                                                </div>
                                            )}
                                            {school && (
                                                <div className="flex items-center">
                                                    <BuildingIcon className="h-4 w-4 mr-1.5" />
                                                    <span>{school.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                        <svg className="h-16 w-16 mb-4 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">All Clear!</h2>
                        <p className="mt-1">You have no active work requests on your hotlist.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyHotlist;