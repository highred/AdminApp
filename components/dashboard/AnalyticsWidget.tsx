import React, { useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { RequestStatus, RequestPriority } from '../../types';
import { ChartBarIcon, GripVerticalIcon } from '../icons/Icons';
import { REQUEST_PRIORITY_COLORS } from '../../constants';

const AnalyticsWidget: React.FC = () => {
    const { workRequests } = useAppContext();

    const analyticsData = useMemo(() => {
        const openRequests = workRequests.filter(req => req.status !== RequestStatus.Completed);

        // Status Pie Chart Data
        const statusCounts = openRequests.reduce((acc, req) => {
            acc[req.status] = (acc[req.status] || 0) + 1;
            return acc;
        }, {} as Record<RequestStatus, number>);
        
        const totalOpen = openRequests.length;
        const statusChartData = Object.entries(statusCounts).map(([status, count]) => ({
            status: status as RequestStatus,
            count,
            percentage: totalOpen > 0 ? (count / totalOpen) * 100 : 0,
        }));

        // Priority Bar Chart Data
        const priorityCounts = openRequests.reduce((acc, req) => {
            acc[req.priority] = (acc[req.priority] || 0) + 1;
            return acc;
        }, {} as Record<RequestPriority, number>);

        const maxPriorityCount = Math.max(0, ...Object.values(priorityCounts));
        const priorityOrder: RequestPriority[] = [RequestPriority.Critical, RequestPriority.High, RequestPriority.Medium, RequestPriority.Low];
        
        const priorityChartData = priorityOrder.map(priority => ({
            priority,
            count: priorityCounts[priority] || 0,
            height: maxPriorityCount > 0 ? ((priorityCounts[priority] || 0) / maxPriorityCount) * 100 : 0,
        }));
        
        // Completed This Week KPI
        const today = new Date();
        const oneWeekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);

        const completedThisWeek = workRequests.filter(req => {
            if (req.status !== RequestStatus.Completed) return false;
            // Assuming completion happens around the due date if available, otherwise submitted date
            const completionReferenceDate = req.dueDate || req.submittedDate;
            if (!completionReferenceDate) return false;
            const refDate = new Date(completionReferenceDate);
            return refDate >= oneWeekAgo && refDate <= today;
        }).length;

        return { statusChartData, priorityChartData, completedThisWeek, totalOpen };
    }, [workRequests]);

    const pieChartStyle = {
        background: `conic-gradient(${
            analyticsData.statusChartData.reduce((acc, data, index, arr) => {
                const statusColorMap: Record<string, string> = {
                    [RequestStatus.NewRequest]: '#ef4444', // red-500
                    [RequestStatus.InProgress]: '#eab308', // yellow-500
                    [RequestStatus.OnHold]: '#6b7280', // gray-500
                };
                const start = arr.slice(0, index).reduce((sum, d) => sum + d.percentage, 0);
                const end = start + data.percentage;
                if(data.status in statusColorMap) {
                    acc.push(`${statusColorMap[data.status]} ${start}% ${end}%`);
                }
                return acc;
            }, [] as string[]).join(', ')
        })`,
    };

    const statusDisplayConfig: Record<string, { color: string, name: RequestStatus }> = {
        [RequestStatus.NewRequest]: { color: 'bg-red-500', name: RequestStatus.NewRequest },
        [RequestStatus.InProgress]: { color: 'bg-yellow-500', name: RequestStatus.InProgress },
        [RequestStatus.OnHold]: { color: 'bg-gray-500', name: RequestStatus.OnHold },
    };

    return (
        <div className="flex flex-col h-full w-full">
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-primary dark:text-indigo-400 flex items-center">
                        <ChartBarIcon className="h-6 w-6 mr-3" />
                        Analytics Overview
                    </h2>
                     <div className="drag-handle cursor-move p-1 -mt-1 -mr-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <GripVerticalIcon className="h-5 w-5" />
                    </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
                    {/* Status Pie Chart */}
                    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Open Requests by Status</h3>
                        {analyticsData.totalOpen > 0 ? (
                            <>
                                <div className="relative w-32 h-32 rounded-full" style={pieChartStyle}>
                                    <div className="absolute inset-2 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                        <span className="text-2xl font-bold">{analyticsData.totalOpen}</span>
                                    </div>
                                </div>
                                <div className="mt-3 space-y-1 text-xs w-full max-w-[150px]">
                                    {analyticsData.statusChartData.filter(d => d.status !== RequestStatus.Completed).map(({ status, count }) => (
                                        <div key={status} className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <span className={`w-2 h-2 rounded-full mr-2 ${statusDisplayConfig[status]?.color}`}></span>
                                                <span>{status}</span>
                                            </div>
                                            <span className="font-medium">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                             <p className="text-sm text-gray-500 dark:text-gray-400">No open requests.</p>
                        )}
                    </div>
                    
                    {/* Priority Bar Chart */}
                    <div className="flex flex-col p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Open Requests by Priority</h3>
                        {analyticsData.totalOpen > 0 ? (
                            <div className="flex-grow flex flex-col justify-end">
                                <div className="flex items-end justify-around gap-2 h-24">
                                    {analyticsData.priorityChartData.map(({ priority, count, height }) => (
                                        <div key={priority} className="w-1/4 h-full flex items-end justify-center" title={`${priority}: ${count}`}>
                                            <div 
                                                className={`w-3/4 rounded-t-md ${REQUEST_PRIORITY_COLORS[priority]}`} 
                                                style={{ height: `${height}%` }}
                                            ></div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-around gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    {analyticsData.priorityChartData.map(({ priority, count }) => (
                                        <p key={priority} className="text-sm font-bold w-1/4 text-center">{count}</p>
                                    ))}
                                </div>
                                <div className="flex justify-around gap-2">
                                    {analyticsData.priorityChartData.map(({ priority }) => (
                                        <p key={priority} className="text-xs text-gray-500 dark:text-gray-400 w-1/4 text-center truncate">{priority}</p>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex-grow flex items-center justify-center">No open requests.</p>
                        )}
                    </div>

                    {/* KPI */}
                    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                         <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Completed This Week</h3>
                         <p className="text-5xl font-bold text-secondary">{analyticsData.completedThisWeek}</p>
                         <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">tasks</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AnalyticsWidget;