import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { Notification, NotificationType } from '../../core/models/notification.model';
import { AuthService } from '../../core/services/auth.service'; // Importa AuthService
import { Router } from '@angular/router'; // Importa Router para posible redirección

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  template: `
    <div class="notifications-container">
      <h1>Notificaciones</h1>
      <div class="notification-list">
        @for (notification of notifications(); track notification.id) {
          <div class="notification-item" [class.unread]="!notification.read">
            <span class="material-icons">{{ getNotificationIcon(notification.type) }}</span>
            <div class="notification-content">
              <p>{{ notification.message }}</p>
              <small>{{ notification.createdAt | date:'medium' }}</small>
            </div>
            <button *ngIf="!notification.read" (click)="markNotificationAsRead(notification.id)" class="mark-as-read-button">
              Marcar leída
            </button>
            <a *ngIf="notification.link" [routerLink]="notification.link" class="notification-link">Ver</a>
          </div>
        }
        @empty {
          <div class="no-notifications-message">No tienes notificaciones por el momento.</div>
        }
      </div>
      <button *ngIf="notifications().length > 0" (click)="markAllNotificationsAsRead()" class="clear-all-button">Marcar todas como leídas</button>
      <div class="unread-count">No leídas: {{ unreadCount() }}</div>
    </div>
  `,
  styles: [`
    /* Tus estilos CSS aquí */
    .notifications-container {
      padding: var(--space-4);
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      color: var(--primary-color);
      text-align: center;
      margin-bottom: var(--space-4);
    }
    .notification-list {
      margin-top: var(--space-4);
      border-radius: var(--border-radius-md);
      overflow: hidden;
      box-shadow: var(--shadow-md);
    }
    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: var(--space-2);
      padding: var(--space-3);
      border-bottom: 1px solid var(--neutral-200);
      background-color: white;
      transition: background-color 0.3s ease;
    }
    .notification-item:last-child {
      border-bottom: none;
    }
    .notification-item.unread {
      background-color: var(--primary-100);
    }
    .material-icons {
      font-size: 24px;
      color: var(--primary-color);
      flex-shrink: 0;
    }
    .notification-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .notification-content p {
      margin: 0;
      font-weight: 500;
      color: var(--neutral-800);
    }
    .notification-content small {
      color: var(--neutral-600);
      font-size: 0.8em;
      margin-top: var(--space-1);
    }
    .mark-as-read-button, .notification-link {
      margin-left: var(--space-2);
      padding: var(--space-1) var(--space-2);
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      font-size: 0.8em;
      text-decoration: none;
      display: inline-block;
      white-space: nowrap;
    }
    .mark-as-read-button {
      background-color: var(--secondary-color);
      color: white;
      border: none;
      transition: background-color 0.2s ease;
    }
    .mark-as-read-button:hover {
      background-color: var(--secondary-700);
    }
    .notification-link {
      background-color: var(--primary-color);
      color: white;
      transition: background-color 0.2s ease;
    }
    .notification-link:hover {
      background-color: var(--primary-700);
    }
    .no-notifications-message {
      text-align: center;
      color: var(--neutral-500);
      padding: var(--space-4);
      background-color: var(--neutral-100);
      border-radius: var(--border-radius-md);
      margin-top: var(--space-4);
      box-shadow: var(--shadow-sm);
    }
    .clear-all-button {
      background-color: var(--warning-color);
      color: white;
      border: none;
      padding: var(--space-2) var(--space-3);
      border-radius: var(--border-radius-md);
      cursor: pointer;
      margin-top: var(--space-4);
      display: block;
      width: fit-content;
      margin-left: auto;
      margin-right: auto;
      transition: background-color 0.2s ease;
    }
    .clear-all-button:hover {
      background-color: var(--warning-700);
    }
    .unread-count {
      text-align: center;
      margin-top: var(--space-3);
      font-weight: 600;
      color: var(--primary-color);
    }

    .notification-item.unread .material-icons {
      color: var(--accent-color);
    }
  `]
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService); // Inyecta AuthService
  private router = inject(Router); // Inyecta Router

  notifications = this.notificationService.notifications;
  unreadCount = this.notificationService.unreadCount;

  constructor() { }

  ngOnInit(): void {
    // Solo carga las notificaciones si hay un token presente
    if (this.authService.getToken()) {
      this.notificationService.getNotifications().subscribe();
    } else {
      console.warn('No hay token de autenticación. Redirigiendo al login.');
      this.router.navigate(['/login']); // Redirige al login si no hay token
    }
  }

  getNotificationIcon(type: NotificationType | string): string {
    switch (type) {
      case 'task_assigned':
      case 'project_invitation':
        return 'assignment';
      case 'task_updated':
      case 'project_updated':
        return 'edit_note';
      case 'task_completed':
        return 'check_circle';
      case 'success':
        return 'check_circle';
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'notifications';
    }
  }

  markNotificationAsRead(notificationId: string): void {
    this.notificationService.markNotificationAsRead(notificationId).subscribe({
      next: () => {
        console.log(`Notificación ${notificationId} marcada como leída.`);
      },
      error: (err: any) => {
        console.error(`Error al marcar notificación ${notificationId} como leída:`, err);
        // Si hay un error 401 aquí, podría ser que el token expiró mientras estabas en la página
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  markAllNotificationsAsRead(): void {
    this.notificationService.markAllNotificationsAsRead().subscribe({
      next: () => {
        console.log('Todas las notificaciones marcadas como leídas.');
      },
      error: (err: any) => {
        console.error('Error al marcar todas las notificaciones como leídas:', err);
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }
}