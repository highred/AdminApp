export enum RequestPriority {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum RequestStatus {
  NewRequest = 'New Request',
  InProgress = 'In Progress',
  OnHold = 'On Hold',
  Completed = 'Completed',
}

export interface Program {
  id: number;
  name: string;
}

export interface School {
  id: number;
  name: string;
  address: string;
  contact: string;
  programId: number;
}

export interface Classroom {
  id: number;
  name: string;
  schoolId: number;
}

export interface WorkRequest {
  id: number;
  description: string;
  requestorName: string;
  submittedDate: string;
  priority: RequestPriority;
  status: RequestStatus;
  schoolId: number | null;
  classroom?: string;
  programId: number | null;
  dueDate: string | null;
}

export type ZoomLevel = 'sm' | 'md' | 'lg';