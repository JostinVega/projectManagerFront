import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Set New Password</h1>
          <p>Enter your new password below</p>
        </div>
        
        <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="password" class="form-label">New Password</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password" 
              class="form-control"
              [class.is-invalid]="password.invalid && (password.dirty || password.touched)"
            >
            @if (password.invalid && (password.dirty || password.touched)) {
              <div class="invalid-feedback">
                @if (password.errors?.['required']) {
                  <span>Password is required</span>
                } @else if (password.errors?.['minlength']) {
                  <span>Password must be at least 8 characters</span>
                }
              </div>
            }
          </div>
          
          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              formControlName="confirmPassword" 
              class="form-control"
              [class.is-invalid]="confirmPassword.invalid && (confirmPassword.dirty || confirmPassword.touched)"
            >
            @if (confirmPassword.invalid && (confirmPassword.dirty || confirmPassword.touched)) {
              <div class="invalid-feedback">
                @if (confirmPassword.errors?.['required']) {
                  <span>Please confirm your password</span>
                } @else if (confirmPassword.errors?.['passwordMismatch']) {
                  <span>Passwords do not match</span>
                }
              </div>
            }
          </div>
          
          <div class="form-group">
            <button 
              type="submit" 
              class="btn btn-primary btn-block" 
              [disabled]="resetPasswordForm.invalid || isLoading"
            >
              @if (isLoading) {
                <span class="spinner-sm"></span>
                <span>Resetting password...</span>
              } @else {
                <span>Reset Password</span>
              }
            </button>
          </div>
        </form>
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
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;
  isLoading = false;
  
  constructor(private fb: FormBuilder) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }
  
  get password() {
    return this.resetPasswordForm.get('password')!;
  }
  
  get confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword')!;
  }
  
  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true };
  }
  
  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    // Password reset logic will be implemented here
  }
}