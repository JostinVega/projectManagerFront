import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Create an Account</h1>
          <p>Sign up to start managing your projects</p>
        </div>
        
        @if (errorMessage) {
          <div class="alert alert-danger">
            {{ errorMessage }}
          </div>
        }
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName" class="form-label">First Name</label>
              <input 
                type="text" 
                id="firstName" 
                formControlName="firstName" 
                class="form-control"
                [class.is-invalid]="firstName.invalid && (firstName.dirty || firstName.touched)"
              >
              @if (firstName.invalid && (firstName.dirty || firstName.touched)) {
                <div class="invalid-feedback">
                  @if (firstName.errors?.['required']) {
                    <span>First name is required</span>
                  }
                </div>
              }
            </div>
            
            <div class="form-group">
              <label for="lastName" class="form-label">Last Name</label>
              <input 
                type="text" 
                id="lastName" 
                formControlName="lastName" 
                class="form-control"
                [class.is-invalid]="lastName.invalid && (lastName.dirty || lastName.touched)"
              >
              @if (lastName.invalid && (lastName.dirty || lastName.touched)) {
                <div class="invalid-feedback">
                  @if (lastName.errors?.['required']) {
                    <span>Last name is required</span>
                  }
                </div>
              }
            </div>
          </div>
          
          <div class="form-group">
            <label for="username" class="form-label">Username</label>
            <input 
              type="text" 
              id="username" 
              formControlName="username" 
              class="form-control"
              [class.is-invalid]="username.invalid && (username.dirty || username.touched)"
            >
            @if (username.invalid && (username.dirty || username.touched)) {
              <div class="invalid-feedback">
                @if (username.errors?.['required']) {
                  <span>Username is required</span>
                } @else if (username.errors?.['minlength']) {
                  <span>Username must be at least 3 characters</span>
                }
              </div>
            }
          </div>
          
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
            <label for="password" class="form-label">Password</label>
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
                } @else if (password.errors?.['minlength']) {
                  <span>Password must be at least 8 characters</span>
                } @else if (password.errors?.['pattern']) {
                  <span>Password must include at least one letter, one number, and one special character</span>
                }
              </div>
            }
            @if (password.valid) {
              <div class="password-strength">
                <div class="strength-meter">
                  <div 
                    class="strength-meter-fill" 
                    [style.width.%]="getPasswordStrength()"
                    [class]="getPasswordStrengthClass()"
                  ></div>
                </div>
                <span class="strength-text">{{ getPasswordStrengthText() }}</span>
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
              [class.is-invalid]="confirmPassword.invalid && (confirmPassword.dirty || confirmPassword.touched) || passwordMismatch"
            >
            @if ((confirmPassword.invalid && (confirmPassword.dirty || confirmPassword.touched)) || passwordMismatch) {
              <div class="invalid-feedback">
                @if (confirmPassword.errors?.['required']) {
                  <span>Please confirm your password</span>
                } @else if (passwordMismatch) {
                  <span>Passwords do not match</span>
                }
              </div>
            }
          </div>
          
          <div class="form-group">
            <label class="form-checkbox">
              <input type="checkbox" formControlName="agreeToTerms">
              <span>I agree to the <a href="#" target="_blank">Terms of Service</a> and <a href="#" target="_blank">Privacy Policy</a></span>
            </label>
            @if (agreeToTerms.invalid && (agreeToTerms.dirty || agreeToTerms.touched)) {
              <div class="invalid-feedback">
                <span>You must agree to the terms to continue</span>
              </div>
            }
          </div>
          
          <div class="form-group">
            <button 
              type="submit" 
              class="btn btn-primary btn-block" 
              [disabled]="registerForm.invalid || isLoading"
            >
              @if (isLoading) {
                <span class="spinner-sm"></span>
                <span>Creating account...</span>
              } @else {
                <span>Create Account</span>
              }
            </button>
          </div>
        </form>
        
        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/auth/login">Log in</a></p>
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
      max-width: 500px;
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
    
    .form-row {
      display: flex;
      gap: var(--space-2);
      margin-bottom: var(--space-3);
    }
    
    .form-row .form-group {
      flex: 1;
      margin-bottom: 0;
    }
    
    .form-group {
      margin-bottom: var(--space-3);
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
    
    .password-strength {
      margin-top: 5px;
      font-size: var(--font-size-sm);
    }
    
    .strength-meter {
      height: 4px;
      background-color: var(--neutral-200);
      border-radius: 2px;
      margin-bottom: 4px;
    }
    
    .strength-meter-fill {
      height: 100%;
      border-radius: 2px;
      transition: width 0.3s ease;
    }
    
    .strength-weak {
      background-color: var(--error-500);
    }
    
    .strength-medium {
      background-color: var(--warning-500);
    }
    
    .strength-strong {
      background-color: var(--success-500);
    }
    
    .strength-text {
      color: var(--neutral-600);
    }
    
    .form-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: var(--font-size-sm);
      color: var(--neutral-700);
    }
    
    .form-checkbox a {
      color: var(--primary-700);
      text-decoration: none;
    }
    
    .form-checkbox a:hover {
      text-decoration: underline;
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
    
    @media (max-width: 576px) {
      .form-row {
        flex-direction: column;
        gap: var(--space-3);
      }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  passwordMismatch = false;
  
  constructor() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]],
      agreeToTerms: [false, [Validators.requiredTrue]]
    });
  }
  
  get firstName() { return this.registerForm.get('firstName')!; }
  get lastName() { return this.registerForm.get('lastName')!; }
  get username() { return this.registerForm.get('username')!; }
  get email() { return this.registerForm.get('email')!; }
  get password() { return this.registerForm.get('password')!; }
  get confirmPassword() { return this.registerForm.get('confirmPassword')!; }
  get agreeToTerms() { return this.registerForm.get('agreeToTerms')!; }
  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  getPasswordStrength(): number {
    if (!this.password.value) return 0;
    
    let score = 0;
    const password = this.password.value;
    
    // Length
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    
    // Complexity
    if (/[A-Z]/.test(password)) score += 15;
    if (/[a-z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    
    // Variety
    const uniqueChars = new Set(password.split('')).size;
    score += Math.min(10, uniqueChars / password.length * 10);
    
    return Math.min(100, score);
  }
  
  getPasswordStrengthClass(): string {
    const strength = this.getPasswordStrength();
    if (strength < 40) return 'strength-weak';
    if (strength < 70) return 'strength-medium';
    return 'strength-strong';
  }
  
  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
  }
  
  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }
    
    this.passwordMismatch = this.password.value !== this.confirmPassword.value;
    if (this.passwordMismatch) {
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    const registerData = {
      firstName: this.firstName.value,
      lastName: this.lastName.value,
      username: this.username.value,
      email: this.email.value,
      password: this.password.value
    };
    
    this.authService.register(registerData).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Registration failed. Please try again.';
      }
    });
  }
}