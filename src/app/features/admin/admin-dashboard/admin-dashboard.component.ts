import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div class="admin-nav">
        <a routerLink="/admin/users" class="btn btn-primary">User Management</a>
      </div>
      <!-- Admin dashboard content will go here -->
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: var(--space-4);
    }
    
    .admin-nav {
      margin-top: var(--space-4);
    }
  `]
})
export class AdminDashboardComponent {}