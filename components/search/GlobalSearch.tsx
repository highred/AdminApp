import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { WorkRequest, School } from '../../types';
import { SearchIcon, ClipboardListIcon, SchoolIcon } from '../icons/Icons';

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
    const { workRequests, schools, openWorkRequestModal } = useAppContext();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            // Timeout ensures the input is visible before focusing
            setTimeout(() => inputRef.current?.focus(), 100); 
            setQuery(''); // Reset query on open
        }
    }, [isOpen]);
    
    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const searchResults = useMemo(() => {
        if (!query.trim()) {
            return { workRequests: [], schools: [] };
        }
        
        const lowerCaseQuery = query.toLowerCase();

        const filteredWorkRequests = workRequests
            .filter(req => 
                req.description.toLowerCase().includes(lowerCaseQuery) ||
                req.requestorName.toLowerCase().includes(lowerCaseQuery) ||
                (req.classroom && req.classroom.toLowerCase().includes(lowerCaseQuery))
            )
            .slice(0, 5); // Limit results

        const filteredSchools = schools
            .filter(school => school.name.toLowerCase().includes(lowerCaseQuery))
            .slice(0, 5); // Limit results

        return { workRequests: filteredWorkRequests, schools: filteredSchools };
    }, [query, workRequests, schools]);

    const handleRequestClick = (request: WorkRequest) => {
        openWorkRequestModal(request, 'edit');
        onClose();
    };

    const handleSchoolClick = (school: School) => {
        navigate(`/schools/${school.id}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start pt-20" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-2xl transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search for requests, schools..."
                        className="w-full pl-12 pr-4 py-4 bg-transparent text-lg text-gray-800 dark:text-white rounded-t-lg focus:outline-none"
                    />
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 max-h-[60vh] overflow-y-auto">
                    {query.trim() && searchResults.workRequests.length === 0 && searchResults.schools.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                            No results found for "{query}"
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                            {searchResults.workRequests.length > 0 && (
                                <li className="px-4 py-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">Work Requests</li>
                            )}
                            {searchResults.workRequests.map(req => (
                                <li key={`req-${req.id}`}>
                                    <button onClick={() => handleRequestClick(req)} className="w-full text-left flex items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <ClipboardListIcon className="h-5 w-5 mr-3 text-gray-400" />
                                        <div className="flex-grow min-w-0">
                                            <p className="font-medium text-gray-800 dark:text-white truncate">{req.description}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">by {req.requestorName}</p>
                                        </div>
                                    </button>
                                </li>
                            ))}

                            {searchResults.schools.length > 0 && (
                                <li className="px-4 py-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">Schools</li>
                            )}
                            {searchResults.schools.map(school => (
                                <li key={`school-${school.id}`}>
                                    <button onClick={() => handleSchoolClick(school)} className="w-full text-left flex items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <SchoolIcon className="h-5 w-5 mr-3 text-gray-400" />
                                        <p className="font-medium text-gray-800 dark:text-white">{school.name}</p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};
export default GlobalSearch;