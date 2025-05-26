import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Welcome Back</h1>
          <p>Log in to your account to continue</p>
        </div>
        
        @if (errorMessage) {
          <div class="alert alert-danger">
            {{ errorMessage }}
          </div>
        }
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email" 
              class="form-control"
              [class.is-invalid]="email.invalid && (email.dirty || email.touched)"
            >
            @if (email.invalid && (email.dirty || email.touched)) {
              <div class="invalid-feedback">
                @if (email.errors?.['required']) {
                  <span>Email is required</span>
                } @else if (email.errors?.['email']) {
                  <span>Please enter a valid email address</span>
                }
              </div>
            }
          </div>
          
          <div class="form-group">
            <div class="password-label-group">
              <label for="password" class="form-label">Password</label>
              <a routerLink="/auth/forgot-password" class="forgot-password">Forgot Password?</a>
            </div>
            <div class="password-input-group">
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                id="password" 
                formControlName="password" 
                class="form-control"
                [class.is-invalid]="password.invalid && (password.dirty || password.touched)"
              >
              <button 
                type="button" 
                class="password-toggle" 
                (click)="togglePasswordVisibility()"
              >
                <span class="material-icons">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
            @if (password.invalid && (password.dirty || password.touched)) {
              <div class="invalid-feedback">
                @if (password.errors?.['required']) {
                  <span>Password is required</span>
                }
              </div>
            }
          </div>
          
          <div class="form-group">
            <button 
              type="submit" 
              class="btn btn-primary btn-block" 
              [disabled]="loginForm.invalid || isLoading"
            >
              @if (isLoading) {
                <span class="spinner-sm"></span>
                <span>Logging in...</span>
              } @else {
                <span>Log In</span>
              }
            </button>
          </div>
        </form>
        
        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/auth/register">Sign up</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
      padding: var(--space-3);
    }
    
    .auth-card {
      width: 100%;
      max-width: 450px;
      background-color: white;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-lg);
      padding: var(--space-4);
    }
    
    .auth-header {
      text-align: center;
      margin-bottom: var(--space-4);
    }
    
    .auth-header h1 {
      font-size: var(--font-size-2xl);
      color: var(--neutral-900);
      margin-bottom: var(--space-1);
    }
    
    .auth-header p {
      color: var(--neutral-600);
    }
    
    .auth-form {
      margin-bottom: var(--space-4);
    }
    
    .form-group {
      margin-bottom: var(--space-3);
    }
    
    .password-label-group {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-1);
    }
    
    .forgot-password {
      font-size: var(--font-size-sm);
      color: var(--primary-700);
      text-decoration: none;
    }
    
    .forgot-password:hover {
      text-decoration: underline;
    }
    
    .password-input-group {
      position: relative;
    }
    
    .password-toggle {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--neutral-500);
      cursor: pointer;
    }
    
    .btn-block {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-1) var(--space-2);
    }
    
    .spinner-sm {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: var(--space-1);
    }
    
    .alert {
      padding: var(--space-2);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--space-3);
      font-size: var(--font-size-sm);
    }
    
    .alert-danger {
      background-color: var(--error-50);
      color: var(--error-700);
      border: 1px solid var(--error-100);
    }
    
    .is-invalid {
      border-color: var(--error-500);
    }
    
    .invalid-feedback {
      color: var(--error-500);
      font-size: var(--font-size-sm);
      margin-top: 5px;
    }
    
    .auth-footer {
      text-align: center;
      font-size: var(--font-size-sm);
      color: var(--neutral-600);
    }
    
    .auth-footer a {
      color: var(--primary-700);
      text-decoration: none;
      font-weight: var(--font-weight-medium);
    }
    
    .auth-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  
  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }
  
  get email() {
    return this.loginForm.get('email')!;
  }
  
  get password() {
    return this.loginForm.get('password')!;
  }
  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Login failed. Please try again.';
      }
    });
  }
}