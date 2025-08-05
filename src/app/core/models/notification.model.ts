// src/app/models/notification.model.ts

export type NotificationType =
  'task_assigned' |
  'task_updated' |
  'task_completed' |
  'project_invitation' |
  'project_updated' |
  'default' | // Un tipo genérico si no se especifica
  'info' |
  'warning' |
  'error' |
  string; // Para permitir cualquier string si hay tipos dinámicos

export interface Notification {
  id: string; // Mapeado desde notificationId del backend por toPublicNotification
  userId: string;
  message: string;
  type: NotificationType;
  read: boolean; // <-- CAMBIADO DE 'isRead' A 'read'
  createdAt: string;
  updatedAt: string; // Asumiendo que updatedAt también existe en el backend
  link?: string; // Opcional, si la notificación debe redirigir
  relatedEntityId?: string; // Opcional, para asociar a una entidad (ej. tarea, proyecto)
}

export interface MarkNotificationReadDto {
  notificationIds: string[];
}