import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { WorkRequest, RequestStatus, RequestPriority } from '../../types';
import { XIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons/Icons';

// --- Helper Functions for Date Formatting ---
const formatDateForInput = (dateString: string): string => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${month}/${day}/${year}`;
};

const formatDateForState = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- Calendar Component ---
interface CalendarDatePickerProps {
  value: string; // Expects 'yyyy-mm-dd'
  onChange: (dateString: string) => void;
  onClose: () => void;
}

const CalendarDatePicker: React.FC<CalendarDatePickerProps> = ({ value, onChange, onClose }) => {
  const calendarRef = useRef<HTMLDivElement>(null);
  const initialDate = value ? new Date(`${value}T00:00:00`) : new Date();
  const [displayDate, setDisplayDate] = useState(initialDate);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const { year, month, daysInMonth, firstDayOfMonth } = useMemo(() => {
    const date = new Date(displayDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { year, month, daysInMonth, firstDayOfMonth };
  }, [displayDate]);

  const handleDayClick = (day: number) => {
    const selected = new Date(year, month, day);
    onChange(formatDateForState(selected));
  };
  
  const handleTodayClick = () => {
      const today = new Date();
      setDisplayDate(today);
      onChange(formatDateForState(today));
  };

  const blanks = Array(firstDayOfMonth).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const today = new Date();

  return (
    <div ref={calendarRef} className="absolute top-full mt-2 w-72 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 p-4">
      <div className="flex justify-between items-center mb-2">
        <button type="button" onClick={() => setDisplayDate(new Date(year, month - 1))} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronLeftIcon className="h-5 w-5"/></button>
        <span className="font-semibold text-sm">{new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(displayDate)}</span>
        <button type="button" onClick={() => setDisplayDate(new Date(year, month + 1))} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRightIcon className="h-5 w-5"/></button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-gray-500 dark:text-gray-400 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, i) => <div key={`blank-${i}`}></div>)}
        {days.map(day => {
          const isSelected = value === formatDateForState(new Date(year, month, day));
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
          return (
            <button
              type="button"
              key={day}
              onClick={() => handleDayClick(day)}
              className={`h-8 w-8 rounded-full text-sm transition-colors ${
                isSelected ? 'bg-primary text-white' : 
                isToday ? 'bg-indigo-100 dark:bg-indigo-900 text-primary dark:text-indigo-300' : 
                'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >{day}</button>
          )
        })}
      </div>
       <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
                type="button"
                onClick={handleTodayClick}
                className="w-full px-4 py-2 text-sm font-medium text-primary dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900"
            >
                Today
            </button>
        </div>
    </div>
  );
};


interface WorkRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: WorkRequest | null;
  mode: 'new' | 'edit' | 'update-status' | 'update-hold-status';
}

const WorkRequestModal: React.FC<WorkRequestModalProps> = ({ isOpen, onClose, request, mode }) => {
  const { 
    addWorkRequest, 
    updateWorkRequest, 
    schools, 
    programs, 
    getSchoolById, 
    getClassroomsBySchoolId 
  } = useAppContext();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<number | ''>('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const initialFormData = {
    description: '',
    requestorName: '',
    schoolId: '' as number | '',
    classroom: '',
    priority: RequestPriority.Medium,
    status: RequestStatus.NewRequest,
    dueDate: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  
  useEffect(() => {
    if (request) {
      const school = request.schoolId ? getSchoolById(request.schoolId) : null;
      setSelectedProgramId(request.programId ?? (school ? school.programId : ''));
      setFormData({
        description: request.description,
        requestorName: request.requestorName,
        schoolId: request.schoolId ?? '',
        classroom: request.classroom ?? '',
        priority: request.priority,
        status: request.status,
        dueDate: request.dueDate || '',
      });
    } else {
      setSelectedProgramId('');
      setFormData(initialFormData);
    }
  }, [request, isOpen, getSchoolById]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'program') {
        const progId = value ? Number(value) : '';
        setSelectedProgramId(progId);
        setFormData(prev => ({ ...prev, schoolId: '', classroom: '' })); 
    } else if (name === 'schoolId') {
        setFormData(prev => ({ ...prev, schoolId: value ? Number(value) : '', classroom: '' }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (mode === 'update-status') {
        if (!request) return;
        if (!formData.dueDate) {
            alert("Please set a due date.");
            setIsSubmitting(false);
            return;
        }
        updateWorkRequest({
            ...request,
            description: formData.description,
            dueDate: formData.dueDate,
            status: RequestStatus.InProgress,
        });
    } else if (mode === 'update-hold-status') {
        if (!request) return;
        updateWorkRequest({
            ...request,
            description: formData.description,
            status: RequestStatus.OnHold,
        });
    } else {
        if (!formData.description || !formData.requestorName || !formData.priority) {
            alert("Please fill in all mandatory fields.");
            setIsSubmitting(false);
            return;
        }
        
        const submissionData = {
          description: formData.description,
          requestorName: formData.requestorName,
          priority: formData.priority,
          schoolId: formData.schoolId === '' ? null : Number(formData.schoolId),
          classroom: formData.classroom || undefined,
          programId: selectedProgramId === '' ? null : Number(selectedProgramId),
        };

        if (mode === 'edit' && request) {
          updateWorkRequest({ ...request, ...submissionData, status: formData.status });
        } else {
          await addWorkRequest(submissionData);
        }
    }

    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  const isEditMode = mode === 'edit';
  const availableSchools = selectedProgramId ? schools.filter(s => s.programId === selectedProgramId) : [];
  const availableClassrooms = formData.schoolId ? getClassroomsBySchoolId(formData.schoolId) : [];
  const priorityLevels = Object.values(RequestPriority);

  const renderModalContent = () => {
    switch (mode) {
        case 'update-status':
            return (
                <>
                    <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-xl font-bold text-gray-800 dark:text-white">Update Task & Set Due Date</h2>
                      <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Close"><XIcon className="h-6 w-6" /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                          <label htmlFor="description-update" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                          <textarea name="description" id="description-update" value={formData.description} onChange={handleChange} rows={4} required className="mt-1 w-full form-input" />
                        </div>
                        <div className="relative">
                          <label htmlFor="dueDate-update" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            name="dueDate" 
                            id="dueDate-update" 
                            value={formatDateForInput(formData.dueDate)} 
                            onClick={() => setIsCalendarOpen(true)}
                            placeholder="mm/dd/yyyy"
                            readOnly
                            className="mt-1 w-full form-input cursor-pointer" 
                          />
                          {isCalendarOpen && (
                            <CalendarDatePicker 
                                value={formData.dueDate}
                                onChange={(date) => {
                                    setFormData(prev => ({ ...prev, dueDate: date }));
                                    setIsCalendarOpen(false);
                                }}
                                onClose={() => setIsCalendarOpen(false)}
                            />
                          )}
                        </div>
                    </div>
                </>
            );
        case 'update-hold-status':
            return (
                <>
                    <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-xl font-bold text-gray-800 dark:text-white">Reason for On Hold</h2>
                      <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Close"><XIcon className="h-6 w-6" /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                          <label htmlFor="description-hold" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Update description with reason (optional)</label>
                          <textarea name="description" id="description-hold" value={formData.description} onChange={handleChange} rows={4} className="mt-1 w-full form-input" />
                        </div>
                    </div>
                </>
            );
        default: // 'new' or 'edit'
            return (
                 <>
                    <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{isEditMode ? 'Edit Work Request' : 'Add New Work Request'}</h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Close"><XIcon className="h-6 w-6" /></button>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description <span className="text-red-500">*</span></label>
                          <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={4} required className="mt-1 w-full form-input" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="requestorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Requestor Name <span className="text-red-500">*</span></label>
                              <input type="text" name="requestorName" id="requestorName" value={formData.requestorName} onChange={handleChange} required className="mt-1 w-full form-input" />
                            </div>
                            <div>
                                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority <span className="text-red-500">*</span></label>
                                <select name="priority" id="priority" value={formData.priority} onChange={handleChange} required className="mt-1 w-full form-input">
                                    {priorityLevels.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="program" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Program</label>
                                <select name="program" id="program" value={selectedProgramId} onChange={handleChange} className="mt-1 w-full form-input">
                                  <option value="">Select a Program</option>
                                  {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="schoolId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">School (Optional)</label>
                                <select name="schoolId" id="schoolId" value={formData.schoolId} onChange={handleChange} className="mt-1 w-full form-input" disabled={!selectedProgramId}>
                                  <option value="">None</option>
                                  {availableSchools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="classroom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Classroom (Optional)</label>
                              <select name="classroom" id="classroom" value={formData.classroom} onChange={handleChange} className="mt-1 w-full form-input" disabled={!formData.schoolId}>
                                  <option value="">None</option>
                                  {availableClassrooms.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                              </select>
                            </div>
                            {isEditMode && (
                              <div>
                                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                                  <select name="status" id="status" value={formData.status} onChange={handleChange} required className="mt-1 w-full form-input">
                                      {Object.values(RequestStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                              </div>
                            )}
                        </div>
                    </div>
                </>
            );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-2xl transform transition-all" role="dialog" aria-modal="true">
        <form onSubmit={handleSubmit}>
          {renderModalContent()}
          <style>{`.form-input { display: block; width: 100%; padding: 0.5rem 0.75rem; font-size: 0.875rem; line-height: 1.25rem; color: #1f2937; background-color: #f9fafb; border: 1px solid #d1d5db; border-radius: 0.5rem; } .dark .form-input { color: #d1d5db; background-color: #374151; border-color: #4b5563; }`}</style>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkRequestModal;