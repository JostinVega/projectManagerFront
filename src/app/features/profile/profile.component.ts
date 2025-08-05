import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

interface UserProfile {
  userId?: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  bio?: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="profile-container">
      <!-- Header Mejorado -->
      <div class="profile-header">
        <div class="header-background"></div>
        <div class="header-content">
          <div class="profile-avatar-section">
            <div class="avatar-container">
              <img [src]="currentAvatarUrl || 'assets/default-avatar.png'" 
                   alt="Profile Avatar" 
                   class="profile-avatar">
              <div class="avatar-badge" [class.online]="true"></div>
            </div>
          </div>
          <div class="profile-info">
            <h1 class="profile-name">{{ userProfile?.firstName }} {{ userProfile?.lastName }}</h1>
            <p class="profile-role">{{ userProfile?.position || 'Usuario' }}</p>
            <p class="profile-email">{{ userProfile?.email }}</p>
          </div>
        </div>
      </div>

      @if (isLoading) {
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>Cargando información del perfil...</p>
        </div>
      } @else if (userProfile) {
        <div class="profile-content">
          <!-- Alertas Globales -->
          @if (successMessage) {
            <div class="alert alert-success">
              <i class="icon-check"></i>
              <span>{{ successMessage }}</span>
              <button class="alert-close" (click)="successMessage = null">×</button>
            </div>
          }
          @if (errorMessage) {
            <div class="alert alert-error">
              <i class="icon-alert"></i>
              <span>{{ errorMessage }}</span>
              <button class="alert-close" (click)="errorMessage = null">×</button>
            </div>
          }

          <div class="content-grid">
            <!-- Sección de Foto de Perfil -->
            <div class="profile-card avatar-card">
              <div class="card-header">
                <h3 class="card-title">
                  <i class="icon-camera"></i>
                  Foto de Perfil
                </h3>
              </div>
              <div class="card-body">
                <div class="avatar-upload-section">
                  <div class="current-avatar">
                    <img [src]="currentAvatarUrl || 'assets/default-avatar.png'" 
                         alt="Current Avatar" 
                         class="avatar-preview">
                    <div class="avatar-overlay" (click)="triggerFileInput()">
                      <i class="icon-camera-plus"></i>
                      <span>Cambiar foto</span>
                    </div>
                  </div>
                  
                  <div class="avatar-info">
                    <h4>Requisitos de la imagen:</h4>
                    <ul>
                      <li>Formato: JPG, PNG o GIF</li>
                      <li>Tamaño máximo: 5MB</li>
                      <li>Recomendado: 400x400px cuadrada</li>
                    </ul>
                  </div>

                  <input #fileInput 
                         type="file" 
                         (change)="onFileSelected($event)" 
                         accept="image/*" 
                         style="display: none;">
                  
                  <div class="avatar-actions">
                    <button type="button" 
                            class="btn btn-primary" 
                            (click)="triggerFileInput()"
                            [disabled]="isUploadingAvatar">
                      @if (isUploadingAvatar) {
                        <i class="icon-loading"></i>
                        Subiendo...
                      } @else {
                        <i class="icon-upload"></i>
                        {{ selectedFile ? 'Cambiar imagen' : 'Subir imagen' }}
                      }
                    </button>
                    
                    @if (selectedFile) {
                      <button type="button" 
                              class="btn btn-success" 
                              (click)="uploadAvatar()"
                              [disabled]="isUploadingAvatar">
                        <i class="icon-save"></i>
                        Guardar cambios
                      </button>
                      <button type="button" 
                              class="btn btn-outline" 
                              (click)="cancelAvatarChange()">
                        <i class="icon-cancel"></i>
                        Cancelar
                      </button>
                    }
                    
                    @if (currentAvatarUrl && !selectedFile) {
                      <button type="button" 
                              class="btn btn-danger-outline" 
                              (click)="removeAvatar()">
                        <i class="icon-trash"></i>
                        Eliminar foto
                      </button>
                    }
                  </div>

                  @if (selectedFile) {
                    <div class="file-preview">
                      <div class="file-info">
                        <i class="icon-file"></i>
                        <div class="file-details">
                          <span class="file-name">{{ selectedFile.name }}</span>
                          <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Información Personal -->
            <div class="profile-card">
              <div class="card-header">
                <h3 class="card-title">
                  <i class="icon-user"></i>
                  Información Personal
                </h3>
              </div>
              <div class="card-body">
                <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
                  <div class="form-grid">
                    <div class="form-group">
                      <label for="firstName">
                        <i class="icon-user"></i>
                        Nombre
                      </label>
                      <input id="firstName" 
                             type="text" 
                             formControlName="firstName" 
                             class="form-input"
                             placeholder="Ingresa tu nombre">
                      @if (profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched) {
                        <span class="error-text">El nombre es requerido</span>
                      }
                    </div>

                    <div class="form-group">
                      <label for="lastName">
                        <i class="icon-user"></i>
                        Apellidos
                      </label>
                      <input id="lastName" 
                             type="text" 
                             formControlName="lastName" 
                             class="form-input"
                             placeholder="Ingresa tus apellidos">
                      @if (profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched) {
                        <span class="error-text">Los apellidos son requeridos</span>
                      }
                    </div>

                    <div class="form-group">
                      <label for="username">
                        <i class="icon-at"></i>
                        Nombre de Usuario
                      </label>
                      <input id="username" 
                             type="text" 
                             formControlName="username" 
                             class="form-input"
                             placeholder="Nombre de usuario único">
                      @if (profileForm.get('username')?.invalid && profileForm.get('username')?.touched) {
                        <span class="error-text">El nombre de usuario es requerido</span>
                      }
                    </div>

                    <div class="form-group">
                      <label for="email">
                        <i class="icon-mail"></i>
                        Correo Electrónico
                      </label>
                      <input id="email" 
                             type="email" 
                             formControlName="email" 
                             class="form-input disabled"
                             readonly>
                      <small class="form-hint">El correo no se puede modificar</small>
                    </div>

                    <div class="form-group">
                      <label for="phone">
                        <i class="icon-phone"></i>
                        Teléfono
                      </label>
                      <input id="phone" 
                             type="tel" 
                             formControlName="phone" 
                             class="form-input"
                             placeholder="+1 (555) 123-4567">
                    </div>

                    <div class="form-group">
                      <label for="position">
                        <i class="icon-briefcase"></i>
                        Cargo
                      </label>
                      <input id="position" 
                             type="text" 
                             formControlName="position" 
                             class="form-input"
                             placeholder="ej. Desarrollador Senior">
                    </div>

                    <div class="form-group">
                      <label for="department">
                        <i class="icon-building"></i>
                        Departamento
                      </label>
                      <input id="department" 
                             type="text" 
                             formControlName="department" 
                             class="form-input"
                             placeholder="ej. Tecnología">
                    </div>

                    <div class="form-group full-width">
                      <label for="bio">
                        <i class="icon-edit"></i>
                        Biografía
                      </label>
                      <textarea id="bio" 
                                formControlName="bio" 
                                rows="4" 
                                class="form-textarea"
                                placeholder="Cuéntanos un poco sobre ti..."></textarea>
                    </div>
                  </div>

                  <div class="form-actions">
                    <button type="button" 
                            class="btn btn-outline" 
                            (click)="resetProfileForm()">
                      <i class="icon-refresh"></i>
                      Restablecer
                    </button>
                    <button type="submit" 
                            class="btn btn-primary" 
                            [disabled]="isUpdatingProfile || profileForm.invalid">
                      @if (isUpdatingProfile) {
                        <i class="icon-loading"></i>
                        Guardando...
                      } @else {
                        <i class="icon-save"></i>
                        Guardar Cambios
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Cambio de Contraseña -->
            <div class="profile-card">
              <div class="card-header">
                <h3 class="card-title">
                  <i class="icon-lock"></i>
                  Seguridad
                </h3>
              </div>
              <div class="card-body">
                <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
                  <div class="form-group">
                    <label for="currentPassword">
                      <i class="icon-key"></i>
                      Contraseña Actual
                    </label>
                    <input id="currentPassword" 
                           type="password" 
                           formControlName="currentPassword" 
                           class="form-input"
                           placeholder="Ingresa tu contraseña actual">
                    @if (passwordForm.get('currentPassword')?.invalid && passwordForm.get('currentPassword')?.touched) {
                      <span class="error-text">La contraseña actual es requerida</span>
                    }
                  </div>

                  <div class="form-group">
                    <label for="newPassword">
                      <i class="icon-shield"></i>
                      Nueva Contraseña
                    </label>
                    <input id="newPassword" 
                           type="password" 
                           formControlName="newPassword" 
                           class="form-input"
                           placeholder="Mínimo 6 caracteres">
                    @if (passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched) {
                      <span class="error-text">La nueva contraseña debe tener al menos 6 caracteres</span>
                    }
                  </div>

                  <div class="form-group">
                    <label for="confirmPassword">
                      <i class="icon-check-shield"></i>
                      Confirmar Nueva Contraseña
                    </label>
                    <input id="confirmPassword" 
                           type="password" 
                           formControlName="confirmPassword" 
                           class="form-input"
                           placeholder="Repite la nueva contraseña">
                    @if (passwordForm.get('confirmPassword')?.invalid && passwordForm.get('confirmPassword')?.touched) {
                      @if (passwordForm.get('confirmPassword')?.errors?.['required']) {
                        <span class="error-text">Confirma tu nueva contraseña</span>
                      }
                      @if (passwordForm.get('confirmPassword')?.errors?.['mismatch']) {
                        <span class="error-text">Las contraseñas no coinciden</span>
                      }
                    }
                  </div>

                  <div class="form-actions">
                    <button type="submit" 
                            class="btn btn-primary" 
                            [disabled]="passwordForm.invalid || isChangingPassword">
                      @if (isChangingPassword) {
                        <i class="icon-loading"></i>
                        Cambiando...
                      } @else {
                        <i class="icon-lock"></i>
                        Cambiar Contraseña
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Preferencias de Notificaciones -->
            <div class="profile-card">
              <div class="card-header">
                <h3 class="card-title">
                  <i class="icon-bell"></i>
                  Notificaciones
                </h3>
              </div>
              <div class="card-body">
                <div class="notification-settings">
                  <div class="notification-item">
                    <div class="notification-info">
                      <div class="notification-title">
                        <i class="icon-mail"></i>
                        Notificaciones por Email
                      </div>
                      <div class="notification-desc">Recibe actualizaciones importantes por correo</div>
                    </div>
                    <div class="toggle-switch">
                      <input type="checkbox" 
                             id="emailNotifications" 
                             [(ngModel)]="emailNotifications" 
                             (change)="updateNotificationSettings()">
                      <label for="emailNotifications" class="toggle-slider"></label>
                    </div>
                  </div>

                  <div class="notification-item">
                    <div class="notification-info">
                      <div class="notification-title">
                        <i class="icon-smartphone"></i>
                        Notificaciones Push
                      </div>
                      <div class="notification-desc">Recibe notificaciones en tiempo real</div>
                    </div>
                    <div class="toggle-switch">
                      <input type="checkbox" 
                             id="pushNotifications" 
                             [(ngModel)]="pushNotifications" 
                             (change)="updateNotificationSettings()">
                      <label for="pushNotifications" class="toggle-slider"></label>
                    </div>
                  </div>

                  <div class="notification-item">
                    <div class="notification-info">
                      <div class="notification-title">
                        <i class="icon-calendar"></i>
                        Resumen Semanal
                      </div>
                      <div class="notification-desc">Recibe un resumen de tu actividad semanal</div>
                    </div>
                    <div class="toggle-switch">
                      <input type="checkbox" 
                             id="weeklyDigest" 
                             [(ngModel)]="weeklyDigest" 
                             (change)="updateNotificationSettings()">
                      <label for="weeklyDigest" class="toggle-slider"></label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Zona de Peligro -->
            <div class="profile-card danger-card">
              <div class="card-header">
                <h3 class="card-title">
                  <i class="icon-alert-triangle"></i>
                  Zona de Peligro
                </h3>
              </div>
              <div class="card-body">
                <div class="danger-section">
                  <div class="danger-info">
                    <h4>Eliminar Cuenta</h4>
                    <p>Elimina permanentemente tu cuenta y todos los datos asociados. Esta acción no se puede deshacer.</p>
                  </div>
                  <button class="btn btn-danger" (click)="deleteAccount()">
                    <i class="icon-trash"></i>
                    Eliminar Cuenta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    /* Variables CSS */
    :host {
      --primary-50: #eff6ff;
      --primary-100: #dbeafe;
      --primary-500: #3b82f6;
      --primary-600: #2563eb;
      --primary-700: #1d4ed8;
      --success-50: #f0fdf4;
      --success-500: #22c55e;
      --success-600: #16a34a;
      --error-50: #fef2f2;
      --error-500: #ef4444;
      --error-600: #dc2626;
      --neutral-50: #f9fafb;
      --neutral-100: #f3f4f6;
      --neutral-200: #e5e7eb;
      --neutral-300: #d1d5db;
      --neutral-400: #9ca3af;
      --neutral-500: #6b7280;
      --neutral-600: #4b5563;
      --neutral-700: #374151;
      --neutral-800: #1f2937;
      --neutral-900: #111827;
      --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      --radius-sm: 0.375rem;
      --radius-md: 0.5rem;
      --radius-lg: 0.75rem;
      --radius-xl: 1rem;
    }

    .profile-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      background-color: #f8fafc;
      min-height: 100vh;
    }

    /* Header Mejorado */
    .profile-header {
      position: relative;
      background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
      border-radius: var(--radius-xl);
      padding: 3rem 2rem 2rem;
      margin-bottom: 2rem;
      box-shadow: var(--shadow-lg);
      overflow: hidden;
    }

    .header-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
      opacity: 0.3;
    }

    .header-content {
      position: relative;
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .profile-avatar-section {
      flex-shrink: 0;
    }

    .avatar-container {
      position: relative;
    }

    .profile-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid rgba(255, 255, 255, 0.2);
      box-shadow: var(--shadow-lg);
      transition: all 0.3s ease;
    }

    .avatar-badge {
      position: absolute;
      bottom: 8px;
      right: 8px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      background-color: var(--neutral-400);
    }

    .avatar-badge.online {
      background-color: var(--success-500);
    }

    .profile-info {
      color: white;
    }

    .profile-name {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .profile-role {
      font-size: 1.25rem;
      margin: 0 0 0.25rem 0;
      opacity: 0.9;
      font-weight: 500;
    }

    .profile-email {
      font-size: 1rem;
      margin: 0;
      opacity: 0.8;
    }

    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      color: var(--neutral-600);
    }

    .loading-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--neutral-200);
      border-top: 4px solid var(--primary-500);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Content Grid */
    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
    }

    /* Cards */
    .profile-card {
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--neutral-200);
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .profile-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .avatar-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .avatar-card .card-header {
      background: rgba(255, 255, 255, 0.1);
      border-bottom-color: rgba(255, 255, 255, 0.2);
    }

    .danger-card {
      border-color: var(--error-200);
    }

    .danger-card:hover {
      border-color: var(--error-300);
      box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.1);
    }

    .card-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--neutral-100);
      background-color: var(--neutral-50);
    }

    .card-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--neutral-900);
    }

    .avatar-card .card-title {
      color: white;
    }

    .card-body {
      padding: 1.5rem;
    }

    /* Icons */
    .icon-camera, .icon-user, .icon-at, .icon-mail, .icon-phone, .icon-briefcase,
    .icon-building, .icon-edit, .icon-lock, .icon-key, .icon-shield, .icon-check-shield,
    .icon-bell, .icon-smartphone, .icon-calendar, .icon-alert-triangle, .icon-trash,
    .icon-save, .icon-refresh, .icon-upload, .icon-cancel, .icon-file, .icon-loading,
    .icon-check, .icon-alert, .icon-camera-plus {
      width: 20px;
      height: 20px;
      display: inline-block;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
    }

    .icon-camera::before { content: "📷"; }
    .icon-user::before { content: "👤"; }
    .icon-at::before { content: "@"; }
    .icon-mail::before { content: "✉️"; }
    .icon-phone::before { content: "📞"; }
    .icon-briefcase::before { content: "💼"; }
    .icon-building::before { content: "🏢"; }
    .icon-edit::before { content: "✏️"; }
    .icon-lock::before { content: "🔒"; }
    .icon-key::before { content: "🔑"; }
    .icon-shield::before { content: "🛡️"; }
    .icon-check-shield::before { content: "✅"; }
    .icon-bell::before { content: "🔔"; }
    .icon-smartphone::before { content: "📱"; }
    .icon-calendar::before { content: "📅"; }
    .icon-alert-triangle::before { content: "⚠️"; }
    .icon-trash::before { content: "🗑️"; }
    .icon-save::before { content: "💾"; }
    .icon-refresh::before { content: "🔄"; }
    .icon-upload::before { content: "⬆️"; }
    .icon-cancel::before { content: "❌"; }
    .icon-file::before { content: "📄"; }
    .icon-loading::before { content: "⏳"; }
    .icon-check::before { content: "✅"; }
    .icon-alert::before { content: "⚠️"; }
    .icon-camera-plus::before { content: "📸"; }

    .icon-loading {
      animation: spin 1s linear infinite;
    }

    /* Avatar Upload Section */
    .avatar-upload-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .current-avatar {
      position: relative;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .current-avatar:hover {
      transform: scale(1.05);
    }

    .current-avatar:hover .avatar-overlay {
      opacity: 1;
    }

    .avatar-preview {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid rgba(255, 255, 255, 0.3);
      box-shadow: var(--shadow-lg);
    }

    .avatar-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: all 0.3s ease;
      color: white;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .avatar-info {
      text-align: center;
      color: rgba(255, 255, 255, 0.9);
    }

    .avatar-info h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
      font-weight: 600;
    }

    .avatar-info ul {
      list-style: none;
      padding: 0;
      margin: 0;
      font-size: 0.875rem;
    }

    .avatar-info li {
      margin-bottom: 0.25rem;
    }

    .avatar-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      justify-content: center;
    }

    .file-preview {
      background: rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-md);
      padding: 1rem;
      width: 100%;
      max-width: 300px;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .file-details {
      display: flex;
      flex-direction: column;
    }

    .file-name {
      font-weight: 500;
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.9);
    }

    .file-size {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.7);
    }

    /* Forms */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--neutral-700);
      font-size: 0.875rem;
    }

    .form-input, .form-textarea {
      padding: 0.75rem;
      border: 2px solid var(--neutral-200);
      border-radius: var(--radius-md);
      background-color: white;
      color: var(--neutral-900);
      font-size: 0.875rem;
      transition: all 0.3s ease;
      font-family: inherit;
    }

    .form-input:focus, .form-textarea:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      transform: translateY(-1px);
    }

    .form-input.disabled {
      background-color: var(--neutral-50);
      color: var(--neutral-600);
      cursor: not-allowed;
    }

    .form-input::placeholder, .form-textarea::placeholder {
      color: var(--neutral-400);
    }

    .form-textarea {
      resize: vertical;
      min-height: 100px;
    }

    .form-hint {
      margin-top: 0.25rem;
      font-size: 0.75rem;
      color: var(--neutral-500);
    }

    .error-text {
      color: var(--error-600);
      font-size: 0.75rem;
      margin-top: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--neutral-100);
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.3s ease;
      text-decoration: none;
      font-family: inherit;
      min-width: 120px;
      justify-content: center;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
      color: white;
      box-shadow: var(--shadow-sm);
    }

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .btn-success {
      background: linear-gradient(135deg, var(--success-500) 0%, var(--success-600) 100%);
      color: white;
      box-shadow: var(--shadow-sm);
    }

    .btn-success:hover:not(:disabled) {
      background: linear-gradient(135deg, var(--success-600) 0%, #15803d 100%);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .btn-outline {
      background-color: transparent;
      color: var(--neutral-700);
      border: 2px solid var(--neutral-300);
    }

    .btn-outline:hover:not(:disabled) {
      background-color: var(--neutral-50);
      border-color: var(--neutral-400);
      transform: translateY(-1px);
    }

    .btn-danger {
      background: linear-gradient(135deg, var(--error-500) 0%, var(--error-600) 100%);
      color: white;
      box-shadow: var(--shadow-sm);
    }

    .btn-danger:hover:not(:disabled) {
      background: linear-gradient(135deg, var(--error-600) 0%, #b91c1c 100%);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .btn-danger-outline {
      background-color: transparent;
      color: var(--error-600);
      border: 2px solid var(--error-300);
    }

    .btn-danger-outline:hover:not(:disabled) {
      background-color: var(--error-50);
      border-color: var(--error-400);
      transform: translateY(-1px);
    }

    /* Notifications */
    .notification-settings {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .notification-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background-color: var(--neutral-50);
      border: 2px solid var(--neutral-100);
      border-radius: var(--radius-lg);
      transition: all 0.3s ease;
    }

    .notification-item:hover {
      border-color: var(--primary-200);
      background-color: var(--primary-50);
      transform: translateY(-1px);
    }

    .notification-info {
      flex: 1;
    }

    .notification-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      color: var(--neutral-900);
      margin-bottom: 0.25rem;
    }

    .notification-desc {
      font-size: 0.875rem;
      color: var(--neutral-600);
    }

    .toggle-switch {
      position: relative;
    }

    .toggle-switch input[type="checkbox"] {
      display: none;
    }

    .toggle-slider {
      display: block;
      width: 60px;
      height: 32px;
      background-color: var(--neutral-300);
      border-radius: 16px;
      position: relative;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
    }

    .toggle-slider::after {
      content: '';
      position: absolute;
      top: 4px;
      left: 4px;
      width: 24px;
      height: 24px;
      background-color: white;
      border-radius: 50%;
      transition: all 0.3s ease;
      box-shadow: var(--shadow-sm);
    }

    .toggle-switch input[type="checkbox"]:checked + .toggle-slider {
      background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
    }

    .toggle-switch input[type="checkbox"]:checked + .toggle-slider::after {
      transform: translateX(28px);
    }

    /* Danger Zone */
    .danger-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
    }

    .danger-info h4 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--error-700);
      margin: 0 0 0.5rem 0;
    }

    .danger-info p {
      font-size: 0.875rem;
      color: var(--neutral-600);
      margin: 0;
      line-height: 1.5;
    }

    /* Alerts */
    .alert {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-radius: var(--radius-lg);
      margin-bottom: 2rem;
      font-size: 0.875rem;
      font-weight: 500;
      box-shadow: var(--shadow-sm);
      animation: slideInDown 0.3s ease;
    }

    @keyframes slideInDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .alert-success {
      background: linear-gradient(135deg, var(--success-50) 0%, #f0fdf4 100%);
      color: var(--success-700);
      border: 2px solid var(--success-200);
    }

    .alert-error {
      background: linear-gradient(135deg, var(--error-50) 0%, #fef2f2 100%);
      color: var(--error-700);
      border: 2px solid var(--error-200);
    }

    .alert-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: inherit;
      opacity: 0.7;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .alert-close:hover {
      opacity: 1;
      background-color: rgba(0,0,0,0.1);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .profile-container {
        padding: 1rem;
      }

      .profile-header {
        padding: 2rem 1.5rem 1.5rem;
      }

      .header-content {
        flex-direction: column;
        text-align: center;
        gap: 1.5rem;
      }

      .profile-name {
        font-size: 2rem;
      }

      .content-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
        gap: 0.75rem;
      }

      .btn {
        width: 100%;
      }

      .avatar-actions {
        flex-direction: column;
        width: 100%;
      }

      .danger-section {
        flex-direction: column;
        align-items: stretch;
        text-align: center;
      }

      .notification-item {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
        text-align: center;
      }

      .alert {
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
      }
    }

    @media (max-width: 480px) {
      .profile-avatar {
        width: 100px;
        height: 100px;
      }

      .avatar-preview {
        width: 120px;
        height: 120px;
      }

      .profile-name {
        font-size: 1.75rem;
      }

      .card-body, .card-header {
        padding: 1rem;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  userProfile: UserProfile | null = null;
  selectedFile: File | null = null;
  currentAvatarUrl: string | undefined = undefined;
  isLoading = true;
  isUpdatingProfile = false;
  isUploadingAvatar = false;
  isChangingPassword = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  emailNotifications: boolean = true;
  pushNotifications: boolean = false;
  weeklyDigest: boolean = true;

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.initForms();
    this.loadUserProfile();
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phone: [''],
      position: [''],
      department: [''],
      bio: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  async loadUserProfile(): Promise<void> {
    this.isLoading = true;
    this.clearMessages();
    
    try {
      const response = await this.http.get<UserProfile>(`${environment.apiUrl}/auth/profile`).toPromise();
      if (response) {
        this.userProfile = response;
        this.profileForm.patchValue(this.userProfile);
        this.currentAvatarUrl = this.userProfile?.avatar;
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.errorMessage = 'Error cargando el perfil. Por favor intenta de nuevo.';
      this.handleAuthError(error);
    } finally {
      this.isLoading = false;
    }
  }

  triggerFileInput(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'El archivo debe ser menor a 5MB.';
        this.selectedFile = null;
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = 'Solo se permiten archivos JPG, PNG y GIF.';
        this.selectedFile = null;
        return;
      }

      this.selectedFile = file;
      this.clearMessages();

      // Preview the selected image
      const reader = new FileReader();
      reader.onload = () => {
        this.currentAvatarUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadAvatar(): Promise<void> {
    if (!this.selectedFile) {
      this.errorMessage = 'No hay archivo seleccionado.';
      return;
    }

    this.isUploadingAvatar = true;
    this.clearMessages();

    try {
      const formData = new FormData();
      formData.append('avatar', this.selectedFile, this.selectedFile.name);

      const response: any = await this.http.put(`${environment.apiUrl}/auth/profile`, formData).toPromise();

      if (response && response.user) {
        this.userProfile = { ...this.userProfile, ...response.user };
        this.currentAvatarUrl = this.userProfile?.avatar;
        this.selectedFile = null;
        this.successMessage = 'Foto de perfil actualizada correctamente.';
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      this.handleUploadError(error);
    } finally {
      this.isUploadingAvatar = false;
    }
  }

  cancelAvatarChange(): void {
    this.selectedFile = null;
    this.currentAvatarUrl = this.userProfile?.avatar;
    this.clearMessages();
  }

  async removeAvatar(): Promise<void> {
    if (!confirm('¿Estás seguro de que quieres eliminar tu foto de perfil?')) {
      return;
    }

    this.isUploadingAvatar = true;
    this.clearMessages();

    try {
      const formData = new FormData();
      formData.append('avatar', 'DELETE_AVATAR');

      const response: any = await this.http.put(`${environment.apiUrl}/auth/profile`, formData).toPromise();

      if (response && response.user) {
        this.userProfile = response.user;
        this.currentAvatarUrl = this.userProfile?.avatar;
        this.selectedFile = null;
        this.successMessage = 'Foto de perfil eliminada correctamente.';
      }
    } catch (error) {
      console.error('Error removing avatar:', error);
      this.errorMessage = 'Error eliminando la foto de perfil.';
      this.handleAuthError(error);
    } finally {
      this.isUploadingAvatar = false;
    }
  }

  async updateProfile(): Promise<void> {
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid) {
      this.errorMessage = 'Por favor corrige los errores en el formulario.';
      return;
    }

    this.isUpdatingProfile = true;
    this.clearMessages();

    try {
      const formData = new FormData();
      Object.keys(this.profileForm.controls).forEach(key => {
        const control = this.profileForm.get(key);
        if (control && control.enabled && control.value !== null) {
          formData.append(key, control.value);
        }
      });

      const response: any = await this.http.put(`${environment.apiUrl}/auth/profile`, formData).toPromise();

      if (response && response.user) {
        this.userProfile = { ...this.userProfile, ...response.user };
        this.successMessage = 'Perfil actualizado correctamente.';
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      this.errorMessage = 'Error actualizando el perfil. Por favor intenta de nuevo.';
      this.handleAuthError(error);
    } finally {
      this.isUpdatingProfile = false;
    }
  }

  resetProfileForm(): void {
    if (this.userProfile) {
      this.profileForm.patchValue(this.userProfile);
      this.clearMessages();
    }
  }

  async changePassword(): Promise<void> {
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid) {
      this.errorMessage = 'Por favor corrige los errores en el formulario de contraseña.';
      return;
    }

    this.isChangingPassword = true;
    this.clearMessages();

    try {
      const { currentPassword, newPassword } = this.passwordForm.value;
      await this.http.put(`${environment.apiUrl}/auth/change-password`, { 
        currentPassword, 
        newPassword 
      }).toPromise();

      this.passwordForm.reset();
      this.successMessage = 'Contraseña cambiada correctamente.';
    } catch (error) {
      console.error('Error changing password:', error);
      if (error instanceof HttpErrorResponse) {
        this.errorMessage = error.error?.message || 'Error cambiando la contraseña.';
      } else {
        this.errorMessage = 'Error desconocido cambiando la contraseña.';
      }
      this.handleAuthError(error);
    } finally {
      this.isChangingPassword = false;
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword?.value && confirmPassword?.value && newPassword.value !== confirmPassword.value) {
      confirmPassword?.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    if (confirmPassword?.errors && !confirmPassword.errors['mismatch']) {
      confirmPassword?.setErrors(null);
    }
    return null;
  }

  async updateNotificationSettings(): Promise<void> {
    this.clearMessages();
    
    try {
      const settings = {
        emailNotifications: this.emailNotifications,
        pushNotifications: this.pushNotifications,
        weeklyDigest: this.weeklyDigest
      };

      await this.http.put(
        `${environment.apiUrl}/auth/notification-settings`,
        settings
      ).toPromise();

      this.successMessage = 'Configuración de notificaciones actualizada.';
    } catch (error) {
      console.error('Error updating notification settings:', error);
      this.errorMessage = 'Error actualizando las notificaciones.';
      this.handleAuthError(error);
    }
  }

  async deleteAccount(): Promise<void> {
    if (!confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.')) {
      return;
    }
    
    if (!confirm('Esto eliminará permanentemente todos tus datos. ¿Estás completamente seguro?')) {
      return;
    }
    
    this.clearMessages();
    
    try {
      await this.http.delete(`${environment.apiUrl}/auth/account`).toPromise();
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Error deleting account:', error);
      this.errorMessage = 'Error eliminando la cuenta.';
      this.handleAuthError(error);
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private clearMessages(): void {
    this.successMessage = null;
    this.errorMessage = null;
  }

  private handleAuthError(error: any): void {
    if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    }
  }

  private handleUploadError(error: any): void {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 413) {
        this.errorMessage = 'El archivo es muy grande. Máximo 5MB permitido.';
      } else if (error.status === 400 && error.error?.message?.includes('Only images allowed')) {
        this.errorMessage = 'Solo se permiten archivos de imagen (PNG, JPG, GIF).';
      } else {
        this.errorMessage = error.error?.message || 'Error subiendo la imagen.';
      }
      this.handleAuthError(error);
    } else {
      this.errorMessage = 'Error desconocido subiendo la imagen.';
    }
  }
}