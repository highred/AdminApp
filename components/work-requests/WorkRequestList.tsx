import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { RequestPriority, RequestStatus, WorkRequest } from '../../types';
import { REQUEST_PRIORITY_TEXT_COLORS } from '../../constants';
import { TrashIcon, BuildingIcon, ChevronUpIcon, ChevronDownIcon } from '../icons/Icons';

type SortableKeys = 'description' | 'programId' | 'schoolId' | 'classroom' | 'requestorName' | 'priority' | 'status' | 'submittedDate' | 'dueDate';

interface WorkRequestListProps {
    requests: WorkRequest[];
    onDeleteRequest: (requestId: number) => void;
}

const WorkRequestList: React.FC<WorkRequestListProps> = ({ requests, onDeleteRequest }) => {
  const { schools, programs, zoomLevel, updateWorkRequest } = useAppContext();
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<RequestPriority | 'All'>('All');
  const [schoolFilter, setSchoolFilter] = useState<number | 'All'>('All');
  const [sortConfig, setSortConfig] = useState<{ key: SortableKeys | 'programName' | 'schoolName'; direction: 'ascending' | 'descending' } | null>({ key: 'submittedDate', direction: 'descending'});
  const [editingCell, setEditingCell] = useState<{ requestId: number, field: SortableKeys } | null>(null);
  const inputRef = useRef<HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement>(null);


  useEffect(() => {
    if (editingCell && inputRef.current) {
        inputRef.current.focus();
    }
  }, [editingCell]);


  const handleUpdate = async (request: WorkRequest, field: SortableKeys, value: any) => {
    let updatedRequest = { ...request, [field]: value };

    // Cascading updates
    if (field === 'programId') {
        const programIdAsNumber = value ? Number(value) : null;
        updatedRequest = { ...request, programId: programIdAsNumber, schoolId: null, classroom: '' };
    } else if (field === 'schoolId' && value === '') {
        updatedRequest = { ...updatedRequest, schoolId: null, classroom: '' };
    } else if (field === 'schoolId') {
        const schoolIdAsNumber = value ? Number(value) : null;
        updatedRequest = { ...updatedRequest, schoolId: schoolIdAsNumber, classroom: '' };
    }

    await updateWorkRequest(updatedRequest);
    setEditingCell(null);
  };

  const renderEditableCell = (request: WorkRequest, field: SortableKeys) => {
    if (editingCell?.requestId !== request.id || editingCell?.field !== field) {
        return null;
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        handleUpdate(request, field, e.target.value);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && e.currentTarget.tagName !== 'TEXTAREA') {
            e.preventDefault();
            e.currentTarget.blur();
        } else if (e.key === 'Escape') {
            setEditingCell(null);
        }
    }

    switch(field) {
        case 'description':
        case 'requestorName':
        case 'classroom':
             return <input 
                ref={inputRef}
                type="text"
                defaultValue={request[field] as string || ''} 
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="w-full bg-inherit p-1 -m-1 border border-primary rounded"
             />
        case 'dueDate':
            return <input
                ref={inputRef}
                type="date"
                defaultValue={request.dueDate || ''}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="w-full bg-inherit p-1 -m-1 border border-primary rounded"
            />
        case 'priority':
            return <select ref={inputRef} defaultValue={request.priority} onChange={(e) => handleUpdate(request, field, e.target.value)} onBlur={() => setEditingCell(null)} onKeyDown={handleKeyDown} className="w-full bg-inherit p-1 -m-1 border border-primary rounded">
                {Object.values(RequestPriority).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
        case 'status':
            return <select ref={inputRef} defaultValue={request.status} onChange={(e) => handleUpdate(request, field, e.target.value)} onBlur={() => setEditingCell(null)} onKeyDown={handleKeyDown} className="w-full bg-inherit p-1 -m-1 border border-primary rounded">
                {Object.values(RequestStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        case 'programId':
            return <select ref={inputRef} defaultValue={request.programId ?? ''} onChange={(e) => handleUpdate(request, field, e.target.value)} onBlur={() => setEditingCell(null)} onKeyDown={handleKeyDown} className="w-full bg-inherit p-1 -m-1 border border-primary rounded">
                 <option value="">Select Program</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
        case 'schoolId':
            const availableSchools = request.programId ? schools.filter(s => s.programId === request.programId) : [];
            return <select ref={inputRef} defaultValue={request.schoolId ?? ''} onChange={(e) => handleUpdate(request, field, e.target.value)} onBlur={() => setEditingCell(null)} onKeyDown={handleKeyDown} className="w-full bg-inherit p-1 -m-1 border border-primary rounded" disabled={!request.programId}>
                <option value="">None</option>
                {availableSchools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
        default: return null;
    }
  }

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
  
  const requestSort = (key: SortableKeys | 'programName' | 'schoolName') => {
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

  const SortableHeader: React.FC<{ sortKey: SortableKeys | 'programName' | 'schoolName' , label: string }> = ({ sortKey, label }) => {
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

  const Cell: React.FC<{ req: WorkRequest, field: SortableKeys, children: React.ReactNode}> = ({req, field, children}) => {
    return (
        <td className={`${paddingClass} font-medium relative group max-w-xs truncate cursor-pointer`} onClick={() => setEditingCell({requestId: req.id, field})}>
            {editingCell?.requestId === req.id && editingCell?.field === field ? renderEditableCell(req, field) : children}
        </td>
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
                        <Cell req={req} field="description">{req.description}</Cell>
                        <Cell req={req} field="programId">{program?.name || 'N/A'}</Cell>
                        <Cell req={req} field="schoolId">
                           <div className="flex items-center">
                                <BuildingIcon className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                <span>{school?.name || 'N/A'}</span>
                            </div>
                        </Cell>
                        <Cell req={req} field="classroom">{req.classroom || 'N/A'}</Cell>
                        <Cell req={req} field="requestorName">{req.requestorName || 'N/A'}</Cell>
                        <Cell req={req} field="priority">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColor}`}>{req.priority}</span>
                        </Cell>
                        <Cell req={req} field="status">{req.status}</Cell>
                        <td className={paddingClass}>{req.submittedDate}</td>
                        <Cell req={req} field="dueDate">{req.dueDate || 'Unassigned'}</Cell>
                        <td className={paddingClass}>
                            <div className="flex items-center space-x-3">
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