import React from 'react';
import { SparklesIcon, XIcon } from '../icons/Icons';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: string;
  isLoading: boolean;
  error: string | null;
}

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose, summary, isLoading, error }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-2xl transform transition-all" role="dialog" aria-modal="true">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <SparklesIcon className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">AI Priority Summary</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Close">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 min-h-[200px] max-h-[60vh] overflow-y-auto">
          {isLoading && (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="ml-4 text-gray-600 dark:text-gray-300">Generating insights...</p>
            </div>
          )}
          {error && (
            <div className="text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-300 p-4 rounded-md">
              <p className="font-bold">An error occurred:</p>
              <p>{error}</p>
            </div>
          )}
          {!isLoading && !error && summary && (
            <div className="text-gray-700 dark:text-gray-300 space-y-4 whitespace-pre-wrap">
                {summary}
            </div>
          )}
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantModal;