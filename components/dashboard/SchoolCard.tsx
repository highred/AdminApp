
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { BuildingIcon } from '../icons/Icons';

const SchoolCard: React.FC<{ schoolId: number }> = ({ schoolId }) => {
    const { getSchoolById, getClassroomsBySchoolId } = useAppContext();
    const school = getSchoolById(schoolId);

    if (!school) return null;

    const classroomCount = getClassroomsBySchoolId(school.id).length;

    return (
        <Link to={`/schools/${school.id}`} className="bg-white dark:bg-dark-card rounded-xl shadow-md overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-primary dark:text-indigo-400 truncate">{school.name}</h2>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200 flex-shrink-0">
                        Active
                    </span>
                </div>
                <p className="mt-2 text-gray-500 dark:text-gray-400 truncate">{school.address}</p>
                <div className="mt-6 grid grid-cols-1 gap-4 text-center text-gray-600 dark:text-gray-300">
                    <div>
                        <BuildingIcon className="h-6 w-6 mx-auto text-indigo-500"/>
                        <p className="mt-1 text-sm font-semibold">{classroomCount}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Classrooms</p>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default SchoolCard;