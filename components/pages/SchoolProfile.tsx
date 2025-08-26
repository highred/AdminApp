
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { BuildingIcon } from '../icons/Icons';

const SchoolProfile: React.FC = () => {
    const { schoolId } = useParams();
    const { getSchoolById, getClassroomsBySchoolId, programs } = useAppContext();

    if (!schoolId) return <div>School not found.</div>;
    
    const school = getSchoolById(Number(schoolId));

    if (!school) return <div>School not found.</div>;
    
    const classrooms = getClassroomsBySchoolId(school.id);
    const program = programs.find(p => p.id === school.programId);

    return (
        <div className="h-full overflow-y-auto">
            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md mb-6">
                <p className="text-gray-500 dark:text-gray-400">{school.address}</p>
                <p className="mt-1 text-gray-500 dark:text-gray-400">Contact: <a href={`mailto:${school.contact}`} className="text-primary hover:underline">{school.contact}</a></p>
                <div className="mt-4 flex space-x-6">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <BuildingIcon className="h-5 w-5 mr-2 text-indigo-500"/>
                        <span>{classrooms.length} Classrooms</span>
                    </div>
                </div>
            </div>

             <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">About this School</h2>
                 <p className="text-gray-600 dark:text-gray-400">
                    This page provides key administrative details for {school.name}. As work requests are managed at the program level, please refer to the Work Requests board for tasks related to the '{program?.name}' program.
                </p>
            </div>
        </div>
    );
};

export default SchoolProfile;