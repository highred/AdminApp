import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Program, School, Classroom, WorkRequest, RequestStatus, ZoomLevel } from '../types';
import { supabase } from '../supabaseClient'; // Import the Supabase client

type AddWorkRequestData = Omit<WorkRequest, 'id' | 'status' | 'submittedDate' | 'dueDate'>;

interface AppContextType {
  programs: Program[];
  schools: School[];
  classrooms: Classroom[];
  workRequests: WorkRequest[];
  isSidebarCollapsed: boolean;
  zoomLevel: ZoomLevel;

  toggleSidebar: () => void;
  setZoomLevel: (level: ZoomLevel) => void;

  addProgram: (name: string) => Promise<void>;
  updateProgram: (program: Program) => Promise<void>;
  
  addSchool: (name: string, programId: number) => Promise<void>;
  updateSchool: (school: School) => Promise<void>;
  deleteSchool: (schoolId: number) => Promise<void>;

  addClassroom: (name: string, schoolId: number) => Promise<void>;
  updateClassroom: (classroom: Classroom) => Promise<void>;
  deleteClassroom: (classroomId: number) => Promise<void>;

  updateWorkRequestStatus: (requestId: number, newStatus: RequestStatus) => Promise<void>;
  addWorkRequest: (requestData: AddWorkRequestData) => Promise<void>;
  updateWorkRequest: (updatedRequest: WorkRequest) => Promise<void>;
  deleteWorkRequest: (requestId: number) => Promise<void>;

  getProgramById: (id: number) => Program | undefined;
  getSchoolById: (id: number) => School | undefined;
  getClassroomsBySchoolId: (schoolId: number) => Classroom[];
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [workRequests, setWorkRequests] = useState<WorkRequest[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('md');

  // --- DATA FETCHING ---
  const fetchData = useCallback(async () => {
    try {
      const { data: programsData, error: programsError } = await supabase.from('programs').select('*').order('name');
      if (programsError) throw programsError;
      setPrograms(programsData);

      const { data: schoolsData, error: schoolsError } = await supabase.from('schools').select('*').order('name');
      if (schoolsError) throw schoolsError;
      const mappedSchools = schoolsData.map(s => ({
        id: s.id,
        name: s.name,
        address: s.address,
        contact: s.contact,
        programId: s.program_id,
      }));
      setSchools(mappedSchools);
      
      const { data: classroomsData, error: classroomsError } = await supabase.from('classrooms').select('*').order('name');
      if (classroomsError) throw classroomsError;
      const mappedClassrooms = classroomsData.map(c => ({
        id: c.id,
        name: c.name,
        schoolId: c.school_id,
      }));
      setClassrooms(mappedClassrooms);

      const { data: workRequestsData, error: workRequestsError } = await supabase.from('work_requests').select('*').order('submitted_date', { ascending: false });
      if (workRequestsError) throw workRequestsError;
      const mappedWorkRequests = workRequestsData.map(req => ({
        id: req.id,
        description: req.description,
        requestorName: req.requestor_name,
        submittedDate: req.submitted_date,
        priority: req.priority,
        status: req.status,
        schoolId: req.school_id,
        classroom: req.classroom,
        programId: req.program_id,
        dueDate: req.due_date,
      }));
      setWorkRequests(mappedWorkRequests as WorkRequest[]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- UI MANAGEMENT ---
  const toggleSidebar = useCallback(() => setIsSidebarCollapsed(prev => !prev), []);

  // --- CRUD OPERATIONS ---
  const addProgram = async (name: string) => {
    const { error } = await supabase.from('programs').insert({ name });
    if (error) console.error(error); else await fetchData();
  };

  const updateProgram = async (updatedProgram: Program) => {
    const { error } = await supabase.from('programs').update({ name: updatedProgram.name }).eq('id', updatedProgram.id);
    if (error) console.error(error); else await fetchData();
  };
  
  const addSchool = async (name: string, programId: number) => {
    const { error } = await supabase.from('schools').insert({ name, program_id: programId, address: 'N/A', contact: 'N/A' });
    if (error) console.error(error); else await fetchData();
  };
  
  const updateSchool = async (updatedSchool: School) => {
    const { error } = await supabase.from('schools').update({ name: updatedSchool.name }).eq('id', updatedSchool.id);
    if (error) console.error(error); else await fetchData();
  };

  const deleteSchool = async (schoolId: number) => {
    const { error } = await supabase.from('schools').delete().eq('id', schoolId);
    if (error) console.error(error); else await fetchData();
  };
  
  const addClassroom = async (name: string, schoolId: number) => {
    const { error } = await supabase.from('classrooms').insert({ name, school_id: schoolId });
    if (error) console.error(error); else await fetchData();
  };

  const updateClassroom = async (updatedClassroom: Classroom) => {
    const { error } = await supabase.from('classrooms').update({ name: updatedClassroom.name }).eq('id', updatedClassroom.id);
    if (error) console.error(error); else await fetchData();
  };
  
  const deleteClassroom = async (classroomId: number) => {
    const { error } = await supabase.from('classrooms').delete().eq('id', classroomId);
    if (error) console.error(error); else await fetchData();
  };

  const addWorkRequest = async (requestData: AddWorkRequestData) => {
    const d = new Date();
    const submittedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const newRequestForDB = {
        description: requestData.description,
        requestor_name: requestData.requestorName,
        priority: requestData.priority,
        classroom: requestData.classroom,
        submitted_date: submittedDate,
        status: RequestStatus.NewRequest,
        program_id: requestData.programId,
        school_id: requestData.schoolId,
    };

    const { error } = await supabase.from('work_requests').insert(newRequestForDB);
    if (error) console.error(error); else await fetchData();
  };

  const updateWorkRequest = async (updatedRequest: WorkRequest) => {
    const requestToUpdate = {
      description: updatedRequest.description,
      requestor_name: updatedRequest.requestorName,
      priority: updatedRequest.priority,
      status: updatedRequest.status,
      classroom: updatedRequest.classroom,
      due_date: updatedRequest.dueDate,
      program_id: updatedRequest.programId,
      school_id: updatedRequest.schoolId
    };
    
    const { error } = await supabase.from('work_requests').update(requestToUpdate).eq('id', updatedRequest.id);
    if (error) console.error(error); else await fetchData();
  };
  
  const updateWorkRequestStatus = async (requestId: number, newStatus: RequestStatus) => {
    const { error } = await supabase.from('work_requests').update({ status: newStatus }).eq('id', requestId);
    if (error) console.error(error); else await fetchData();
  };

  const deleteWorkRequest = async (requestId: number) => {
    const { error } = await supabase.from('work_requests').delete().eq('id', requestId);
    if (error) console.error(error); else await fetchData();
  };
  
  // --- GETTERS (operate on local state for performance) ---
  const getProgramById = useCallback((id: number) => programs.find(p => p.id === id), [programs]);
  const getSchoolById = useCallback((id: number) => schools.find(s => s.id === id), [schools]);
  const getClassroomsBySchoolId = useCallback((schoolId: number) => classrooms.filter(c => c.schoolId === schoolId), [classrooms]);

  const value = {
    programs,
    schools,
    classrooms,
    workRequests,
    isSidebarCollapsed,
    zoomLevel,
    toggleSidebar,
    setZoomLevel,
    addProgram,
    updateProgram,
    addSchool,
    updateSchool,
    deleteSchool,
    addClassroom,
    updateClassroom,
    deleteClassroom,
    addWorkRequest,
    updateWorkRequest,
    updateWorkRequestStatus,
    deleteWorkRequest,
    getProgramById,
    getSchoolById,
    getClassroomsBySchoolId,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};