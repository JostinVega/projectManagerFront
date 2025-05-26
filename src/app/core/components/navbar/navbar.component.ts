import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar">
      <div class="container">
        <div class="navbar-brand">
          <a routerLink="/" class="logo">ProjectFlow</a>
        </div>
        
        <button class="mobile-menu-toggle hide-md-up" (click)="toggleMobileMenu()">
          <span class="material-icons">{{ isMobileMenuOpen ? 'close' : 'menu' }}</span>
        </button>
        
        <nav class="navbar-menu" [class.is-active]="isMobileMenuOpen">
          @if (authService.isLoggedIn()) {
            <ul class="navbar-nav">
              <li><a routerLink="/dashboard" routerLinkActive="active">Dashboard</a></li>
              <li><a routerLink="/projects" routerLinkActive="active">Projects</a></li>
              <li><a routerLink="/tasks" routerLinkActive="active">Tasks</a></li>
              <li><a routerLink="/kanban" routerLinkActive="active">Kanban</a></li>
              @if (authService.isAdmin()) {
                <li><a routerLink="/admin" routerLinkActive="active">Admin</a></li>
              }
            </ul>
            
            <div class="navbar-end">
              <a routerLink="/notifications" class="notifications-icon">
                <span class="material-icons">notifications</span>
                @if (unreadCount() > 0) {
                  <span class="notification-badge">{{ unreadCount() }}</span>
                }
              </a>
              
              <div class="user-menu">
                <button class="user-menu-toggle" (click)="toggleUserMenu()">
                  <span class="user-initials">{{ userInitials }}</span>
                </button>
                
                @if (isUserMenuOpen) {
                  <div class="user-dropdown">
                    <div class="user-dropdown-header">
                      <p>{{ userName }}</p>
                      <small class="text-muted">{{ userEmail }}</small>
                    </div>
                    <div class="user-dropdown-body">
                      <a routerLink="/profile" class="dropdown-item">
                        <span class="material-icons">person</span> Profile
                      </a>
                      <a routerLink="/settings" class="dropdown-item">
                        <span class="material-icons">settings</span> Settings
                      </a>
                      <hr>
                      <button class="dropdown-item" (click)="logout()">
                        <span class="material-icons">logout</span> Logout
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          } @else {
            <ul class="navbar-nav">
              <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a></li>
              <li><a routerLink="/features" routerLinkActive="active">Features</a></li>
              <li><a routerLink="/pricing" routerLinkActive="active">Pricing</a></li>
            </ul>
            
            <div class="navbar-end">
              <a routerLink="/auth/login" class="btn btn-outline">Login</a>
              <a routerLink="/auth/register" class="btn btn-primary">Sign Up</a>
            </div>
          }
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      background-color: white;
      box-shadow: var(--shadow-sm);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .navbar .container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
    }
    
    .navbar-brand {
      display: flex;
      align-items: center;
    }
    
    .logo {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--primary-700);
      text-decoration: none;
    }
    
    .navbar-menu {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex: 1;
      margin-left: var(--space-4);
    }
    
    .navbar-nav {
      display: flex;
      list-style: none;
    }
    
    .navbar-nav li {
      margin-right: var(--space-3);
    }
    
    .navbar-nav a {
      text-decoration: none;
      color: var(--neutral-700);
      font-weight: var(--font-weight-medium);
      padding: var(--space-1) 0;
      position: relative;
    }
    
    .navbar-nav a:hover {
      color: var(--primary-700);
    }
    
    .navbar-nav a.active {
      color: var(--primary-700);
    }
    
    .navbar-nav a.active::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: var(--primary-700);
    }
    
    .navbar-end {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    
    .notifications-icon {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: var(--space-2);
      color: var(--neutral-700);
    }
    
    .notification-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background-color: var(--error-500);
      color: white;
      font-size: 10px;
      height: 16px;
      width: 16px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .user-menu {
      position: relative;
    }
    
    .user-menu-toggle {
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 0;
    }
    
    .user-initials {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: var(--primary-100);
      color: var(--primary-700);
      font-weight: var(--font-weight-medium);
    }
    
    .user-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      width: 240px;
      background-color: white;
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-lg);
      margin-top: var(--space-1);
      z-index: 10;
      animation: fadeIn var(--transition-normal);
    }
    
    .user-dropdown-header {
      padding: var(--space-2);
      border-bottom: 1px solid var(--neutral-200);
    }
    
    .user-dropdown-body {
      padding: var(--space-1);
    }
    
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      padding: var(--space-1) var(--space-2);
      color: var(--neutral-700);
      text-decoration: none;
      border-radius: var(--border-radius-sm);
      transition: background-color var(--transition-fast);
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      font-size: var(--font-size-md);
    }
    
    .dropdown-item:hover {
      background-color: var(--neutral-100);
      color: var(--primary-700);
    }
    
    .mobile-menu-toggle {
      display: none;
      background: none;
      border: none;
      color: var(--neutral-800);
      cursor: pointer;
    }
    
    @media (max-width: 768px) {
      .mobile-menu-toggle {
        display: block;
      }
      
      .navbar-menu {
        position: fixed;
        top: 64px;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: white;
        flex-direction: column;
        padding: var(--space-2);
        transform: translateX(-100%);
        transition: transform var(--transition-normal);
        margin-left: 0;
      }
      
      .navbar-menu.is-active {
        transform: translateX(0);
      }
      
      .navbar-nav {
        flex-direction: column;
        width: 100%;
      }
      
      .navbar-nav li {
        margin-right: 0;
        margin-bottom: var(--space-2);
      }
      
      .navbar-end {
        margin-top: var(--space-3);
        width: 100%;
        justify-content: center;
      }
      
      .btn {
        width: 100%;
        margin-top: var(--space-2);
        padding: var(--space-1) var(--space-3);
      }
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  
  userName = '';
  userEmail = '';
  userInitials = '';
  
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  
  unreadCount = this.notificationService.unreadCount;
  
  constructor() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.userName = `${user.firstName} ${user.lastName}`;
        this.userEmail = user.email;
        this.userInitials = user.firstName.charAt(0) + user.lastName.charAt(0);
      }
    });
  }
  
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      this.isUserMenuOpen = false;
    }
  }
  
  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }
  
  logout(): void {
    this.authService.logout();
    this.isUserMenuOpen = false;
  }
}