import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile">
      <h1>Profile</h1>
      <!-- Profile content will go here -->
    </div>
  `,
  styles: [`
    .profile {
      padding: var(--space-4);
    }
  `]
})
export class ProfileComponent {}