
import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons/Icons';
import { REQUEST_PRIORITY_COLORS } from '../../constants';
import { WorkRequest } from '../../types';

interface WorkRequestCalendarProps {
    requests: WorkRequest[];
}

const WorkRequestCalendar: React.FC<WorkRequestCalendarProps> = ({ requests }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const { month, year, daysInMonth, firstDayOfMonth } = useMemo(() => {
        const date = new Date(currentDate);
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        return { year, month, daysInMonth, firstDayOfMonth };
    }, [currentDate]);

    const getRequestsForDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return requests.filter(req => req.submittedDate === dateStr);
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };
    
    const renderCalendarGrid = () => {
        const blanks = Array(firstDayOfMonth).fill(null);
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const totalSlots = [...blanks, ...days];

        return totalSlots.map((day, index) => {
            if (!day) {
                return <div key={`blank-${index}`} className="border-r border-b dark:border-gray-700"></div>;
            }
            const dayRequests = getRequestsForDay(day);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            
            return (
                <div key={day} className="p-2 border-r border-b dark:border-gray-700 min-h-[120px] flex flex-col">
                    <span className={`font-semibold ${isToday ? 'bg-primary text-white rounded-full h-6 w-6 flex items-center justify-center' : ''}`}>
                        {day}
                    </span>
                    <div className="mt-1 space-y-1 overflow-y-auto">
                        {dayRequests.map(req => (
                             <div key={req.id} title={req.description} className="relative group flex items-center text-xs p-1 rounded-md bg-gray-100 dark:bg-gray-800 cursor-pointer">
                                 <span className={`w-2 h-2 rounded-full mr-1.5 flex-shrink-0 ${REQUEST_PRIORITY_COLORS[req.priority]}`}></span>
                                 <span className="truncate">{req.description}</span>
                                 <div className="absolute bottom-full mb-2 w-72 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg text-sm text-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 left-0">
                                    <h4 className="font-bold mb-1 text-gray-800 dark:text-white">Full Description</h4>
                                    <p className="whitespace-pre-wrap">{req.description}</p>
                                </div>
                             </div>
                        ))}
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <h2 className="text-xl font-bold">
                    {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate)}
                </h2>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <ChevronRightIcon className="h-6 w-6" />
                </button>
            </div>
            <div className="grid grid-cols-7 border-t border-l dark:border-gray-700">
                {daysOfWeek.map(day => (
                    <div key={day} className="text-center font-bold p-2 border-r border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        {day}
                    </div>
                ))}
                {renderCalendarGrid()}
            </div>
        </div>
    );
};

export default WorkRequestCalendar;
