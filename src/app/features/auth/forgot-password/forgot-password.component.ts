import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Reset Password</h1>
          <p>Enter your email to receive reset instructions</p>
        </div>
        
        <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="auth-form">
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
            <button 
              type="submit" 
              class="btn btn-primary btn-block" 
              [disabled]="forgotPasswordForm.invalid || isLoading"
            >
              @if (isLoading) {
                <span class="spinner-sm"></span>
                <span>Sending...</span>
              } @else {
                <span>Send Reset Link</span>
              }
            </button>
          </div>
        </form>
        
        <div class="auth-footer">
          <p>Remember your password? <a routerLink="/auth/login">Log in</a></p>
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
      max-width: 400px;
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
  `]
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  
  constructor(private fb: FormBuilder) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
  
  get email() {
    return this.forgotPasswordForm.get('email')!;
  }
  
  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    // Password reset logic will be implemented here
  }
}