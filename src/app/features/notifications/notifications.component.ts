import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications">
      <h1>Notifications</h1>
      <div class="notification-list">
        @for (notification of notifications(); track notification.id) {
          <div class="notification-item" [class.unread]="!notification.isRead">
            <span class="material-icons">{{ getNotificationIcon(notification.type) }}</span>
            <div class="notification-content">
              <p>{{ notification.message }}</p>
              <small>{{ notification.createdAt | date:'medium' }}</small>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .notifications {
      padding: var(--space-4);
    }
    
    .notification-list {
      margin-top: var(--space-4);
    }
    
    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: var(--space-2);
      padding: var(--space-2);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--space-2);
      background-color: white;
      box-shadow: var(--shadow-sm);
    }
    
    .notification-item.unread {
      background-color: var(--primary-50);
    }
    
    .notification-content {
      flex: 1;
    }
    
    .notification-content p {
      margin-bottom: var(--space-1);
    }
    
    .notification-content small {
      color: var(--neutral-600);
    }
  `]
})
export class NotificationsComponent {
  private notificationService = inject(NotificationService);
  notifications = this.notificationService.notifications;
  
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'task_assigned':
        return 'assignment_ind';
      case 'task_updated':
        return 'update';
      case 'task_completed':
        return 'task_alt';
      case 'project_invitation':
        return 'group_add';
      case 'project_updated':
        return 'edit';
      default:
        return 'notifications';
    }
  }
}