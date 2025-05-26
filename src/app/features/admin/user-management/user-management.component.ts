import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-management">
      <h1>User Management</h1>
      <!-- User management content will go here -->
    </div>
  `,
  styles: [`
    .user-management {
      padding: var(--space-4);
    }
  `]
})
export class UserManagementComponent {}