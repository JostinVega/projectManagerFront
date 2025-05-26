import { User } from './user.model';
import { Task } from './task.model';
import { Project } from './project.model';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  user: User | string;
  relatedTask?: Task | string;
  relatedProject?: Project | string;
  createdAt: Date;
}

export enum NotificationType {
  TASK_ASSIGNED = 'task_assigned',
  TASK_UPDATED = 'task_updated',
  TASK_COMPLETED = 'task_completed',
  PROJECT_INVITATION = 'project_invitation',
  PROJECT_UPDATED = 'project_updated'
}

export interface MarkNotificationReadDto {
  notificationIds: string[];
}