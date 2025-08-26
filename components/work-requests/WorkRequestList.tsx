import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { RequestPriority, RequestStatus, WorkRequest } from '../../types';
import { REQUEST_PRIORITY_TEXT_COLORS } from '../../constants';
import { PencilIcon, TrashIcon, BuildingIcon, ChevronUpIcon, ChevronDownIcon } from '../icons/Icons';

type SortableKeys = keyof WorkRequest | 'programName' | 'schoolName';

interface WorkRequestListProps {
    requests: WorkRequest[];
    onEditRequest: (request: WorkRequest) => void;
    onDeleteRequest: (requestId: number) => void;
}

const WorkRequestList: React.FC<WorkRequestListProps> = ({ requests, onEditRequest, onDeleteRequest }) => {
  const { schools, programs, zoomLevel } = useAppContext();
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<RequestPriority | 'All'>('All');
  const [schoolFilter, setSchoolFilter] = useState<number | 'All'>('All');
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>({ key: 'submittedDate', direction: 'descending'});

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const statusMatch = statusFilter === 'All' || req.status === statusFilter;
      const priorityMatch = priorityFilter === 'All' || req.priority === priorityFilter;
      const schoolMatch = schoolFilter === 'All' || req.schoolId === schoolFilter;
      return statusMatch && priorityMatch && schoolMatch;
    });
  }, [requests, statusFilter, priorityFilter, schoolFilter]);

  const sortedRequests = useMemo(() => {
    let sortableItems = [...filteredRequests];
    if (sortConfig !== null) {
        sortableItems.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            if (sortConfig.key === 'programName') {
                aValue = programs.find(p => p.id === a.programId)?.name ?? '';
                bValue = programs.find(p => p.id === b.programId)?.name ?? '';
            } else if (sortConfig.key === 'schoolName') {
                aValue = schools.find(s => s.id === a.schoolId)?.name ?? '';
                bValue = schools.find(s => s.id === b.schoolId)?.name ?? '';
            } else {
                aValue = a[sortConfig.key as keyof WorkRequest];
                bValue = b[sortConfig.key as keyof WorkRequest];
            }
            
            if (aValue === null || aValue === undefined) aValue = '';
            if (bValue === null || bValue === undefined) bValue = '';

            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }
    return sortableItems;
  }, [filteredRequests, sortConfig, programs, schools]);
  
  const requestSort = (key: SortableKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const paddingClass = useMemo(() => {
    switch(zoomLevel) {
      case 'sm': return 'p-2';
      case 'lg': return 'p-5';
      default: return 'p-4';
    }
  }, [zoomLevel]);

  const SortableHeader: React.FC<{ sortKey: SortableKeys, label: string }> = ({ sortKey, label }) => {
    const isSorted = sortConfig?.key === sortKey;
    const icon = isSorted ? (sortConfig?.direction === 'ascending' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />) : null;
    return (
        <th className={`${paddingClass} font-semibold whitespace-nowrap`}>
            <button onClick={() => requestSort(sortKey)} className="flex items-center space-x-1 group">
                <span>{label}</span>
                <span className={`transition-opacity ${isSorted ? 'opacity-100' : 'opacity-30 group-hover:opacity-100'}`}>{icon}</span>
            </button>
        </th>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select
          className="w-full px-4 py-2 bg-gray-100 dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RequestStatus | 'All')}
        >
          <option value="All">All Statuses</option>
          {Object.values(RequestStatus).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <select
          className="w-full px-4 py-2 bg-gray-100 dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as RequestPriority | 'All')}
        >
          <option value="All">All Priorities</option>
          {Object.values(RequestPriority).map(priority => (
            <option key={priority} value={priority}>{priority}</option>
          ))}
        </select>
        <select
          className="w-full px-4 py-2 bg-gray-100 dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          value={schoolFilter}
          onChange={(e) => setSchoolFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
        >
          <option value="All">All Schools</option>
          {schools.map(school => (
            <option key={school.id} value={school.id}>{school.name}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700 z-10">
            <tr>
              <SortableHeader sortKey="description" label="Description" />
              <SortableHeader sortKey="programName" label="Program" />
              <SortableHeader sortKey="schoolName" label="School" />
              <SortableHeader sortKey="classroom" label="Classroom" />
              <SortableHeader sortKey="requestorName" label="Requestor" />
              <SortableHeader sortKey="priority" label="Priority" />
              <SortableHeader sortKey="status" label="Status" />
              <SortableHeader sortKey="submittedDate" label="Submitted" />
              <SortableHeader sortKey="dueDate" label="Due Date" />
              <th className={`${paddingClass} font-semibold whitespace-nowrap`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedRequests.map((req) => {
                const priorityColor = REQUEST_PRIORITY_TEXT_COLORS[req.priority];
                const school = req.schoolId ? schools.find(s => s.id === req.schoolId) : null;
                const program = req.programId ? programs.find(p => p.id === req.programId) : null;
                return (
                    <tr key={req.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className={`${paddingClass} font-medium relative group max-w-xs truncate`}>
                            {req.description}
                            <div className="absolute bottom-full mb-2 w-72 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg text-sm text-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 left-0">
                                <h4 className="font-bold mb-1 text-gray-800 dark:text-white">Full Description</h4>
                                <p className="whitespace-pre-wrap">{req.description}</p>
                            </div>
                        </td>
                        <td className={paddingClass}>{program?.name || 'N/A'}</td>
                        <td className={paddingClass}>
                           <div className="flex items-center">
                                <BuildingIcon className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                <span>{school?.name || 'N/A'}</span>
                            </div>
                        </td>
                        <td className={paddingClass}>{req.classroom || 'N/A'}</td>
                        <td className={paddingClass}>{req.requestorName || 'N/A'}</td>
                        <td className={paddingClass}>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColor}`}>{req.priority}</span>
                        </td>
                        <td className={paddingClass}>{req.status}</td>
                        <td className={paddingClass}>{req.submittedDate}</td>
                        <td className={paddingClass}>{req.dueDate || 'Unassigned'}</td>
                        <td className={paddingClass}>
                            <div className="flex items-center space-x-3">
                                <button onClick={() => onEditRequest(req)} className="text-gray-400 hover:text-primary dark:hover:text-indigo-400" aria-label="Edit request">
                                    <PencilIcon className="h-5 w-5" />
                                </button>
                                <button onClick={() => onDeleteRequest(req.id)} className="text-gray-400 hover:text-red-500" aria-label="Delete request">
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </td>
                    </tr>
                );
            })}
          </tbody>
        </table>
        {sortedRequests.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No requests match the current filters.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default WorkRequestList;