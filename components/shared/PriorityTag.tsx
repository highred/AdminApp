import React from 'react';
import { RequestPriority } from '../../types';
import { REQUEST_PRIORITY_COLORS } from '../../constants';
import { FireIcon } from '../icons/Icons';

interface PriorityTagProps {
    priority: RequestPriority;
}

const PriorityTag: React.FC<PriorityTagProps> = ({ priority }) => {
    const color = REQUEST_PRIORITY_COLORS[priority];
    const text = priority;
    
    if (priority === RequestPriority.Critical) {
        return (
            <div className="flex items-center text-xs text-purple-600 dark:text-purple-400 font-semibold">
                <FireIcon className="h-3 w-3 mr-1.5" />
                <span>{text}</span>
            </div>
        );
    }
    
    return (
        <div className="flex items-center text-xs">
            <span className={`w-2.5 h-2.5 rounded-full mr-1.5 ${color}`}></span>
            <span>{text}</span>
        </div>
    );
};

export default PriorityTag;