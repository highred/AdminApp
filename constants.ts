import { Program, School, Classroom, WorkRequest, RequestPriority, RequestStatus } from './types';

export const PROGRAMS: Program[] = [
  { id: 1, name: 'Instructional Support' },
  { id: 2, name: 'Assistive Technology' },
  { id: 3, name: 'SLE' },
  { id: 4, name: 'Vision' },
  { id: 5, name: 'Transition' },
  { id: 6, name: 'SLP' },
  { id: 7, name: 'SMNP' },
];


export const SCHOOLS: School[] = [
  { id: 1, name: 'Sunshine Elementary', address: '123 Meadow Lane, Sunnyville, 12345', contact: 'principal.sunshine@edu.com', programId: 1 },
  { id: 2, name: 'Northwood High', address: '456 Oak Avenue, Forest City, 67890', contact: 'principal.northwood@edu.com', programId: 5 },
  { id: 3, name: 'Lakeside Middle', address: '789 Pine Street, Laketown, 54321', contact: 'principal.lakeside@edu.com', programId: 2 },
  { id: 4, name: 'Oakhaven Academy', address: '101 Academy Rd, Oakhaven, 11223', contact: 'principal.oakhaven@edu.com', programId: 3 },
  { id: 5, name: 'Beacon School for Vision', address: '212 Beacon St, Brightview, 44556', contact: 'principal.beacon@edu.com', programId: 4 },
  { id: 6, name: 'Riverbend Elementary', address: '333 River Rd, Waterton, 77889', contact: 'principal.riverbend@edu.com', programId: 1 },
  { id: 7, name: 'Speech & Language Center', address: '456 Communication Way, Oratoria, 99887', contact: 'principal.slp@edu.com', programId: 6 },
  { id: 8, name: 'Northstar Management Prep', address: '789 Leadership Dr, Govern, 66554', contact: 'principal.smnp@edu.com', programId: 7 },
];

export const CLASSROOMS: Classroom[] = [
  // Sunshine Elementary (School 1)
  { id: 1, name: 'Room 101', schoolId: 1 },
  { id: 2, name: 'Room 102', schoolId: 1 },
  { id: 3, name: 'Art Room', schoolId: 1 },
  { id: 4, name: 'Music Room', schoolId: 1 },
  { id: 5, name: 'Library', schoolId: 1 },
  // Northwood High (School 2)
  { id: 6, name: 'Room 203', schoolId: 2 },
  { id: 7, name: 'Room 205', schoolId: 2 },
  { id: 8, name: 'Gymnasium', schoolId: 2 },
  { id: 9, name: 'Cafeteria', schoolId: 2 },
  // Lakeside Middle (School 3)
  { id: 10, name: 'Portable A', schoolId: 3 },
  { id: 11, name: 'Science Lab', schoolId: 3 },
];

const d = new Date();
const year = d.getFullYear();
const month = (d.getMonth() + 1).toString().padStart(2, '0');
const dayAfterTomorrow = new Date();
dayAfterTomorrow.setDate(d.getDate() + 2);

export const WORK_REQUESTS: WorkRequest[] = [
  { id: 1, schoolId: 1, programId: 1, classroom: 'Room 101', description: 'The projector in Room 101 is flickering and the bulb needs to be replaced.', requestorName: 'Alice Johnson', submittedDate: `${year}-${month}-08`, priority: RequestPriority.High, status: RequestStatus.NewRequest, dueDate: null },
  { id: 2, schoolId: 2, programId: 5, classroom: 'Library', description: 'Order 30 copies of the new 10th grade math textbook "Advanced Algebra".', requestorName: 'Charlie Brown', submittedDate: `${year}-${month}-15`, priority: RequestPriority.Medium, status: RequestStatus.InProgress, dueDate: `${dayAfterTomorrow.getFullYear()}-${String(dayAfterTomorrow.getMonth() + 1).padStart(2, '0')}-${String(dayAfterTomorrow.getDate()).padStart(2, '0')}` },
  { id: 3, schoolId: 2, programId: 5, description: 'The faucet in the main staff room is dripping constantly. Needs a new washer.', requestorName: 'Diana Prince', submittedDate: `${year}-${month}-01`, priority: RequestPriority.Low, status: RequestStatus.Completed, dueDate: `${year}-${month}-05` },
  { id: 4, schoolId: 3, programId: 2, description: 'Requesting approval for the 8th grade field trip to the Science Museum scheduled for November 15th.', requestorName: 'Ethan Hunt', submittedDate: `${year}-${month}-18`, priority: RequestPriority.Critical, status: RequestStatus.OnHold, dueDate: null },
  { id: 5, schoolId: null, programId: null, description: 'Complete new hire onboarding for Fiona Glenanne. Paperwork is on my desk.', requestorName: 'Diana Prince', submittedDate: `${year}-${month}-22`, priority: RequestPriority.Medium, status: RequestStatus.InProgress, dueDate: `${year}-${month}-28` },
  { id: 6, schoolId: 2, programId: 5, classroom: 'Room 203', description: 'The smartboard in Room 203 is frozen and will not respond to touch or the remote.', requestorName: 'Helen Troy', submittedDate: `${year}-${month}-11`, priority: RequestPriority.High, status: RequestStatus.NewRequest, dueDate: null },
];

export const REQUEST_PRIORITY_COLORS: Record<RequestPriority, string> = {
  [RequestPriority.Critical]: 'bg-purple-500',
  [RequestPriority.High]: 'bg-red-500',
  [RequestPriority.Medium]: 'bg-yellow-500',
  [RequestPriority.Low]: 'bg-green-500',
};

export const REQUEST_PRIORITY_ORDER: Record<RequestPriority, number> = {
  [RequestPriority.Critical]: 4,
  [RequestPriority.High]: 3,
  [RequestPriority.Medium]: 2,
  [RequestPriority.Low]: 1,
};

export const REQUEST_STATUS_ORDER: Record<RequestStatus, number> = {
  [RequestStatus.InProgress]: 2,
  [RequestStatus.NewRequest]: 1,
  [RequestStatus.OnHold]: 0,
  [RequestStatus.Completed]: 0,
};

export const REQUEST_PRIORITY_TEXT_COLORS: Record<RequestPriority, string> = {
  [RequestPriority.Critical]: 'text-purple-800 dark:text-purple-300 bg-purple-100 dark:bg-purple-900',
  [RequestPriority.High]: 'text-red-800 dark:text-red-300 bg-red-100 dark:bg-red-900',
  [RequestPriority.Medium]: 'text-yellow-800 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900',
  [RequestPriority.Low]: 'text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-900',
};

// Virtual statuses for time-based Kanban columns
export const VIRTUAL_STATUS_NEW_0_7_DAYS = 'New (0-7 Days)';
export const VIRTUAL_STATUS_NEW_8_14_DAYS = 'New (8-14 Days)';
export const VIRTUAL_STATUS_NEW_15_PLUS_DAYS = 'New (15+ Days)';

export const KANBAN_COLUMN_COLORS: Record<string, string> = {
    [VIRTUAL_STATUS_NEW_0_7_DAYS]: 'border-t-blue-500',
    [VIRTUAL_STATUS_NEW_8_14_DAYS]: 'border-t-yellow-500',
    [VIRTUAL_STATUS_NEW_15_PLUS_DAYS]: 'border-t-red-500',
    [RequestStatus.InProgress]: 'border-t-orange-500',
    [RequestStatus.OnHold]: 'border-t-gray-500',
    [RequestStatus.Completed]: 'border-t-green-500',
};

export const programToSlug = (programName: string): string => {
    return programName.toLowerCase().replace(/\s+/g, '-');
};