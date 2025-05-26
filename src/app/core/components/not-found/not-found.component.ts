import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="not-found">
      <div class="not-found-content">
        <h1 class="not-found-title">404</h1>
        <h2 class="not-found-subtitle">Page Not Found</h2>
        <p class="not-found-message">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <a routerLink="/" class="btn btn-primary">Go to Home</a>
      </div>
    </div>
  `,
  styles: [`
    .not-found {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 70vh;
      padding: var(--space-4);
      text-align: center;
    }
    
    .not-found-content {
      max-width: 500px;
    }
    
    .not-found-title {
      font-size: 8rem;
      font-weight: var(--font-weight-bold);
      color: var(--primary-500);
      line-height: 1;
      margin-bottom: var(--space-2);
    }
    
    .not-found-subtitle {
      font-size: var(--font-size-2xl);
      margin-bottom: var(--space-3);
      color: var(--neutral-800);
    }
    
    .not-found-message {
      color: var(--neutral-600);
      margin-bottom: var(--space-4);
    }
    
    .btn {
      display: inline-block;
      padding: var(--space-1) var(--space-3);
    }
  `]
})
export class NotFoundComponent {}