// src/app/core/services/notification.service.ts

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/notifications`;

  public notifications = signal<Notification[]>([]);
  public unreadCount = signal<number>(0);

  constructor() {
    // ELIMINADO: Ya no se llama getNotifications() desde el constructor.
    // Esto previene que se intente cargar notificaciones antes de que el usuario esté autenticado.
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl).pipe(
      tap(notifications => {
        this.notifications.set(notifications);
        this.updateUnreadCount();
      }),
      // El manejo de error es crucial para el 401
      catchError(error => {
        console.error('getNotifications failed:', error);
        // Si es 401, podrías redirigir al login o limpiar el estado
        if (error.status === 401) {
          console.warn('Acceso no autorizado a notificaciones. Considere redirigir al login.');
          // Aquí podrías añadir lógica para redirigir, por ejemplo:
          // const router = inject(Router); // Necesitarías inyectar Router si lo haces aquí
          // router.navigate(['/login']);
          this.notifications.set([]); // Limpiar notificaciones
          this.unreadCount.set(0); // Limpiar contador
        }
        return throwError(() => new Error(error.message || 'Error al cargar notificaciones.'));
      })
    );
  }

  markNotificationAsRead(notificationId: string): Observable<Notification> {
    return this.http.put<Notification>(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
      tap(updatedNotification => {
        const updatedNotifications = this.notifications().map(notification => {
          return notification.id === updatedNotification.id ? { ...notification, read: true } : notification;
        });
        this.notifications.set(updatedNotifications);
        this.updateUnreadCount();
      }),
      catchError(this.handleError<Notification>('markNotificationAsRead'))
    );
  }

  markAllNotificationsAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        const updatedNotifications = this.notifications().map(notification => ({
          ...notification,
          read: true
        }));
        this.notifications.set(updatedNotifications);
        this.unreadCount.set(0);
      }),
      catchError(this.handleError<void>('markAllNotificationsAsRead'))
    );
  }

  private updateUnreadCount(): void {
    const count = this.notifications().filter(notification => !notification.read).length;
    this.unreadCount.set(count);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return throwError(() => new Error(error.message || `Ocurrió un error en ${operation}`));
    };
  }
}