import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification, MarkNotificationReadDto } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/notifications`;
  
  public notifications = signal<Notification[]>([]);
  public unreadCount = signal<number>(0);
  
  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl).pipe(
      tap(notifications => {
        this.notifications.set(notifications);
        this.updateUnreadCount();
      })
    );
  }
  
  markAsRead(notificationIds: string[]): Observable<void> {
    const dto: MarkNotificationReadDto = { notificationIds };
    return this.http.post<void>(`${this.apiUrl}/read`, dto).pipe(
      tap(() => {
        const updatedNotifications = this.notifications().map(notification => {
          if (notificationIds.includes(notification.id)) {
            return { ...notification, isRead: true };
          }
          return notification;
        });
        
        this.notifications.set(updatedNotifications);
        this.updateUnreadCount();
      })
    );
  }
  
  markAllAsRead(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        const updatedNotifications = this.notifications().map(notification => ({
          ...notification,
          isRead: true
        }));
        
        this.notifications.set(updatedNotifications);
        this.unreadCount.set(0);
      })
    );
  }
  
  private updateUnreadCount(): void {
    const count = this.notifications().filter(notification => !notification.isRead).length;
    this.unreadCount.set(count);
  }
}