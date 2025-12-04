export interface User {
  id: string;
  name: string;
  avatarColor: string;
}

export interface Task {
  id: string;
  userId: string;
  content: string;
  isCompleted: boolean;
  createdAt: number;
  completedAt?: number;
}

export enum FilterType {
  ALL = 'ALL',
  MY_TASKS = 'MY_TASKS',
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING'
}
