import { User } from './user.model';

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  status: ProjectStatus;
  owner: User | string;
  members: (User | string)[];
  createdAt: Date;
  updatedAt: Date;
}

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled'
}

export interface CreateProjectDto {
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  status: ProjectStatus;
  members: string[];
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status?: ProjectStatus;
  members?: string[];
}