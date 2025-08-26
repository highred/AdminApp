import React, { useState, useCallback, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Program, School, Classroom } from '../../types';
import { PencilIcon, TrashIcon, PlusIcon, ChevronUpIcon } from '../icons/Icons';

type EditModalState = {
    isOpen: boolean;
    type: 'Program' | 'School' | 'Classroom' | null;
    data: Program | School | Classroom | { programId?: number; schoolId?: number } | null;
};

const Admin: React.FC = () => {
    const {
        programs, schools, classrooms,
        addProgram, updateProgram,
        addSchool, updateSchool, deleteSchool,
        addClassroom, updateClassroom, deleteClassroom
    } = useAppContext();
    
    const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
    const [modalState, setModalState] = useState<EditModalState>({ isOpen: false, type: null, data: null });

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleOpenModal = (type: EditModalState['type'], data: EditModalState['data']) => {
        setModalState({ isOpen: true, type, data });
    };

    const handleCloseModal = () => {
        setModalState({ isOpen: false, type: null, data: null });
    };

    const handleSave = (name: string) => {
        if (!modalState.type || !modalState.data) return;

        switch (modalState.type) {
            case 'Program':
                if ('id' in modalState.data) {
                    updateProgram({ ...(modalState.data as Program), name });
                } else {
                    addProgram(name);
                }
                break;
            case 'School':
                if ('id' in modalState.data) {
                    updateSchool({ ...(modalState.data as School), name });
                } else if ('programId' in modalState.data && modalState.data.programId) {
                    addSchool(name, modalState.data.programId);
                }
                break;
            case 'Classroom':
                 if ('id' in modalState.data) {
                    updateClassroom({ ...(modalState.data as Classroom), name });
                } else if ('schoolId' in modalState.data && modalState.data.schoolId) {
                    addClassroom(name, modalState.data.schoolId);
                }
                break;
        }
        handleCloseModal();
    };
    
    const handleDelete = (type: 'School' | 'Classroom', id: number) => {
        if (window.confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
             switch (type) {
                case 'School': deleteSchool(id); break;
                case 'Classroom': deleteClassroom(id); break;
            }
        }
    };

    return (
        <div className="space-y-6 h-full overflow-y-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Organization</h1>
                <button onClick={() => handleOpenModal('Program', {})} className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Program
                </button>
            </div>

            <div className="space-y-4">
                {programs.map(program => {
                    const programSchools = schools.filter(s => s.programId === program.id);
                    const isProgramExpanded = expandedIds[`p-${program.id}`];
                    return (
                        <div key={program.id} className="bg-white dark:bg-dark-card rounded-lg shadow-md">
                            <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(`p-${program.id}`)}>
                                <div className="flex items-center">
                                    <h2 className="text-xl font-bold">{program.name}</h2>
                                    <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">{programSchools.length} Schools</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal('Program', program); }} className="p-1 text-gray-400 hover:text-primary"><PencilIcon className="h-5 w-5"/></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal('School', { programId: program.id }); }} className="p-1 text-gray-400 hover:text-green-500"><PlusIcon className="h-5 w-5"/></button>
                                    <ChevronUpIcon className={`h-5 w-5 transition-transform ${isProgramExpanded ? '' : 'rotate-180'}`} />
                                </div>
                            </div>
                            {isProgramExpanded && (
                                <div className="px-4 pb-4 border-t dark:border-gray-700">
                                    {programSchools.map(school => {
                                        const schoolClassrooms = classrooms.filter(c => c.schoolId === school.id);
                                        const isSchoolExpanded = expandedIds[`s-${school.id}`];
                                        return (
                                            <div key={school.id} className="mt-3 bg-gray-50 dark:bg-gray-800 rounded">
                                                <div className="p-3 flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(`s-${school.id}`)}>
                                                    <div className="flex items-center">
                                                        <h3 className="font-semibold">{school.name}</h3>
                                                        <span className="ml-3 text-xs text-gray-500 dark:text-gray-400">{schoolClassrooms.length} Classrooms</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                         <button onClick={(e) => { e.stopPropagation(); handleOpenModal('School', school); }} className="p-1 text-gray-400 hover:text-primary"><PencilIcon className="h-4 w-4"/></button>
                                                         <button onClick={(e) => { e.stopPropagation(); handleDelete('School', school.id); }} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="h-4 w-4"/></button>
                                                         <button onClick={(e) => { e.stopPropagation(); handleOpenModal('Classroom', { schoolId: school.id }); }} className="p-1 text-gray-400 hover:text-green-500"><PlusIcon className="h-4 w-4"/></button>
                                                         <ChevronUpIcon className={`h-4 w-4 transition-transform ${isSchoolExpanded ? '' : 'rotate-180'}`} />
                                                    </div>
                                                </div>
                                                {isSchoolExpanded && (
                                                    <div className="px-3 pb-3 border-t dark:border-gray-600">
                                                        <ul className="mt-2 space-y-1 pl-4 list-disc list-inside text-sm">
                                                            {schoolClassrooms.map(classroom => (
                                                                <li key={classroom.id} className="flex justify-between items-center">
                                                                    <span>{classroom.name}</span>
                                                                    <div className="flex items-center space-x-1">
                                                                        <button onClick={() => handleOpenModal('Classroom', classroom)} className="p-1 text-gray-400 hover:text-primary"><PencilIcon className="h-4 w-4"/></button>
                                                                        <button onClick={() => handleDelete('Classroom', classroom.id)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="h-4 w-4"/></button>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <EditModal modalState={modalState} onClose={handleCloseModal} onSave={handleSave} />
        </div>
    );
};

interface EditModalProps {
    modalState: EditModalState;
    onClose: () => void;
    onSave: (name: string) => void;
}
const EditModal: React.FC<EditModalProps> = ({ modalState, onClose, onSave }) => {
    const [name, setName] = useState('');

    useEffect(() => {
        if (modalState.isOpen && modalState.data && 'name' in modalState.data) {
            setName(modalState.data.name as string);
        } else {
            setName('');
        }
    }, [modalState]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(name);
    };

    if (!modalState.isOpen) return null;

    const isEditing = modalState.data && 'id' in modalState.data;
    const title = `${isEditing ? 'Edit' : 'Add'} ${modalState.type}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div className="p-4 border-b dark:border-gray-700">
                        <h3 className="text-lg font-bold">{title}</h3>
                    </div>
                    <div className="p-4">
                        <label htmlFor="name" className="block text-sm font-medium">{modalState.type} Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default Admin;