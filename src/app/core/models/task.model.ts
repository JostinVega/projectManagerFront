import { User } from './user.model';
import { Project } from './project.model';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: Date;
  status: TaskStatus;
  priority: TaskPriority;
  project: Project | string;
  assignedTo?: User | string;
  createdBy: User | string;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaskStatus {
  TODO = 'pending',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'completed'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface CreateTaskDto {
  title: string;
  description: string;
  dueDate?: Date;
  status: TaskStatus;
  priority: TaskPriority;
  project: string;
  assignedTo?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  dueDate?: Date;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
}