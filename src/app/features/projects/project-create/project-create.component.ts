import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface CreateProjectRequest {
  name: string;
  description?: string;
  members: string[];
  startDate?: Date;
  endDate?: Date;
  status: 'planning' | 'active' | 'on-hold' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="project-create">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <button class="back-button" (click)="goBack()">
            <span class="material-icons">arrow_back</span>
          </button>
          <div class="header-text">
            <h1 class="page-title">Create New Project</h1>
            <p class="page-subtitle">Set up a new project to organize your tasks and collaborate with your team.</p>
          </div>
        </div>
      </div>

      <!-- Form Container -->
      <div class="form-container">
        <form [formGroup]="projectForm" (ngSubmit)="onSubmit()" class="project-form">
          <!-- Basic Information -->
          <div class="form-section">
            <div class="section-header">
              <h2 class="section-title">Basic Information</h2>
              <p class="section-description">Provide the essential details for your project.</p>
            </div>

            <div class="form-grid">
              <!-- Project Name -->
              <div class="form-group full-width">
                <label for="name" class="form-label">
                  Project Name <span class="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  class="form-input"
                  placeholder="Enter project name"
                  formControlName="name"
                  [class.error]="isFieldInvalid('name')"
                >
                @if (isFieldInvalid('name')) {
                  <div class="field-error">
                    @if (projectForm.get('name')?.errors?.['required']) {
                      Project name is required
                    }
                    @if (projectForm.get('name')?.errors?.['minlength']) {
                      Project name must be at least 3 characters long
                    }
                  </div>
                }
              </div>

              <!-- Project Description -->
              <div class="form-group full-width">
                <label for="description" class="form-label">Description</label>
                <textarea
                  id="description"
                  class="form-textarea"
                  placeholder="Describe your project goals, scope, and key deliverables..."
                  formControlName="description"
                  rows="4"
                ></textarea>
              </div>

              <!-- Priority and Status -->
              <div class="form-group">
                <label for="priority" class="form-label">
                  Priority <span class="required">*</span>
                </label>
                <select
                  id="priority"
                  class="form-select"
                  formControlName="priority"
                  [class.error]="isFieldInvalid('priority')"
                >
                  <option value="">Select priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                @if (isFieldInvalid('priority')) {
                  <div class="field-error">Priority is required</div>
                }
              </div>

              <div class="form-group">
                <label for="status" class="form-label">
                  Initial Status <span class="required">*</span>
                </label>
                <select
                  id="status"
                  class="form-select"
                  formControlName="status"
                  [class.error]="isFieldInvalid('status')"
                >
                  <option value="">Select status</option>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                </select>
                @if (isFieldInvalid('status')) {
                  <div class="field-error">Status is required</div>
                }
              </div>
            </div>
          </div>

          <!-- Timeline -->
          <div class="form-section">
            <div class="section-header">
              <h2 class="section-title">Timeline</h2>
              <p class="section-description">Set the project timeline (optional).</p>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="startDate" class="form-label">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  class="form-input"
                  formControlName="startDate"
                  [min]="today"
                >
              </div>

              <div class="form-group">
                <label for="endDate" class="form-label">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  class="form-input"
                  formControlName="endDate"
                  [min]="projectForm.get('startDate')?.value || today"
                  [class.error]="isFieldInvalid('endDate')"
                >
                @if (isFieldInvalid('endDate')) {
                  <div class="field-error">End date must be after start date</div>
                }
              </div>
            </div>
          </div>

          <!-- Team Members -->
          <div class="form-section">
            <div class="section-header">
              <h2 class="section-title">Team Members</h2>
              <p class="section-description">Add team members to collaborate on this project.</p>
            </div>

            <div class="members-section">
              <!-- Search Users -->
              <div class="member-search">
                <div class="search-input-wrapper">
                  <span class="material-icons search-icon">search</span>
                  <input
                    type="text"
                    class="search-input"
                    placeholder="Search users by name or email..."
                    [(ngModel)]="searchQuery"
                    (input)="searchUsers()"
                    [ngModelOptions]="{standalone: true}"
                  >
                </div>
                
                @if (searchResults.length > 0 && searchQuery.length > 0) {
                  <div class="search-results">
                    @for (user of searchResults; track user._id) {
                      <div 
                        class="search-result-item"
                        (click)="addMember(user)"
                        [class.disabled]="isMemberAdded(user._id)"
                      >
                        <div class="user-avatar">
                          {{ user.firstName.charAt(0) + user.lastName.charAt(0) }}
                        </div>
                        <div class="user-info">
                          <div class="user-name">{{ user.firstName }} {{ user.lastName }}</div>
                          <div class="user-email">{{ user.email }}</div>
                        </div>
                        @if (isMemberAdded(user._id)) {
                          <span class="material-icons added-icon">check_circle</span>
                        } @else {
                          <span class="material-icons add-icon">add</span>
                        }
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Selected Members -->
              @if (selectedMembers.length > 0) {
                <div class="selected-members">
                  <h4 class="members-title">Selected Members ({{ selectedMembers.length }})</h4>
                  <div class="members-list">
                    @for (member of selectedMembers; track member._id) {
                      <div class="member-item">
                        <div class="member-avatar">
                          {{ member.firstName.charAt(0) + member.lastName.charAt(0) }}
                        </div>
                        <div class="member-info">
                          <div class="member-name">{{ member.firstName }} {{ member.lastName }}</div>
                          <div class="member-email">{{ member.email }}</div>
                        </div>
                        <button
                          type="button"
                          class="remove-member"
                          (click)="removeMember(member._id)"
                          title="Remove member"
                        >
                          <span class="material-icons">close</span>
                        </button>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button
              type="button"
              class="btn btn-outline"
              (click)="goBack()"
              [disabled]="isSubmitting"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="projectForm.invalid || isSubmitting"
            >
              @if (isSubmitting) {
                <span class="loading-spinner"></span>
                Creating...
              } @else {
                <span class="material-icons">add</span>
                Create Project
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .project-create {
      padding: var(--space-4);
      max-width: 800px;
      margin: 0 auto;
      min-height: calc(100vh - 200px);
    }

    .page-header {
      margin-bottom: var(--space-5);
    }

    .header-content {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
    }

    .back-button {
      background: white;
      border: 1px solid var(--neutral-300);
      border-radius: var(--border-radius-md);
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
      flex-shrink: 0;
    }

    .back-button:hover {
      background-color: var(--neutral-50);
      border-color: var(--neutral-400);
    }

    .header-text {
      flex: 1;
    }

    .page-title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--neutral-900);
      margin-bottom: var(--space-1);
    }

    .page-subtitle {
      color: var(--neutral-600);
      font-size: var(--font-size-lg);
      margin: 0;
    }

    .form-container {
      background: white;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--neutral-200);
      overflow: hidden;
    }

    .project-form {
      padding: var(--space-5);
    }

    .form-section {
      margin-bottom: var(--space-6);
    }

    .form-section:last-of-type {
      margin-bottom: var(--space-5);
    }

    .section-header {
      margin-bottom: var(--space-4);
      padding-bottom: var(--space-3);
      border-bottom: 1px solid var(--neutral-200);
    }

    .section-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--neutral-900);
      margin-bottom: var(--space-1);
    }

    .section-description {
      color: var(--neutral-600);
      font-size: var(--font-size-md);
      margin: 0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-label {
      font-weight: var(--font-weight-medium);
      color: var(--neutral-900);
      margin-bottom: var(--space-2);
      font-size: var(--font-size-sm);
    }

    .required {
      color: var(--error-500);
    }

    .form-input,
    .form-select,
    .form-textarea {
      padding: var(--space-3);
      border: 1px solid var(--neutral-300);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-md);
      transition: all var(--transition-fast);
      background-color: white;
    }

    .form-input:focus,
    .form-select:focus,
    .form-textarea:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 2px var(--primary-100);
    }

    .form-input.error,
    .form-select.error,
    .form-textarea.error {
      border-color: var(--error-500);
      box-shadow: 0 0 0 2px var(--error-100);
    }

    .form-textarea {
      resize: vertical;
      min-height: 100px;
    }

    .field-error {
      color: var(--error-600);
      font-size: var(--font-size-sm);
      margin-top: var(--space-1);
    }

    .members-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .member-search {
      position: relative;
    }

    .search-input-wrapper {
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: var(--space-3);
      top: 50%;
      transform: translateY(-50%);
      color: var(--neutral-500);
      font-size: 20px;
    }

    .search-input {
      width: 100%;
      padding: var(--space-3) var(--space-3) var(--space-3) var(--space-8);
      border: 1px solid var(--neutral-300);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-md);
    }

    .search-input:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 2px var(--primary-100);
    }

    .search-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid var(--neutral-300);
      border-top: none;
      border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
      box-shadow: var(--shadow-lg);
      max-height: 240px;
      overflow-y: auto;
      z-index: 10;
    }

    .search-result-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3);
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }

    .search-result-item:hover:not(.disabled) {
      background-color: var(--neutral-50);
    }

    .search-result-item.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: var(--primary-100);
      color: var(--primary-600);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-sm);
      flex-shrink: 0;
    }

    .user-info {
      flex: 1;
    }

    .user-name {
      font-weight: var(--font-weight-medium);
      color: var(--neutral-900);
      margin-bottom: 2px;
    }

    .user-email {
      font-size: var(--font-size-sm);
      color: var(--neutral-600);
    }

    .add-icon {
      color: var(--primary-600);
    }

    .added-icon {
      color: var(--success-600);
    }

    .selected-members {
      border: 1px solid var(--neutral-200);
      border-radius: var(--border-radius-md);
      padding: var(--space-4);
      background-color: var(--neutral-50);
    }

    .members-title {
      font-weight: var(--font-weight-medium);
      color: var(--neutral-900);
      margin-bottom: var(--space-3);
      font-size: var(--font-size-md);
    }

    .members-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .member-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-2);
      background: white;
      border-radius: var(--border-radius-md);
      border: 1px solid var(--neutral-200);
    }

    .member-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: var(--primary-100);
      color: var(--primary-600);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-xs);
      flex-shrink: 0;
    }

    .member-info {
      flex: 1;
    }

    .member-name {
      font-weight: var(--font-weight-medium);
      color: var(--neutral-900);
      font-size: var(--font-size-sm);
      margin-bottom: 2px;
    }

    .member-email {
      font-size: var(--font-size-xs);
      color: var(--neutral-600);
    }

    .remove-member {
      background: none;
      border: none;
      color: var(--neutral-500);
      cursor: pointer;
      padding: var(--space-1);
      border-radius: var(--border-radius-sm);
      transition: all var(--transition-fast);
    }

    .remove-member:hover {
      background-color: var(--error-100);
      color: var(--error-600);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding-top: var(--space-4);
      border-top: 1px solid var(--neutral-200);
    }

    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: var(--space-1);
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .project-create {
        padding: var(--space-3);
      }

      .project-form {
        padding: var(--space-4);
      }

      .form-grid {
        grid-template-columns: 1fr;
        gap: var(--space-3);
      }

      .form-actions {
        flex-direction: column-reverse;
      }

      .form-actions .btn {
        width: 100%;
      }

      .header-content {
        align-items: center;
      }

      .page-title {
        font-size: var(--font-size-xl);
      }

      .page-subtitle {
        font-size: var(--font-size-md);
      }
    }
  `]
})
export class ProjectCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  projectForm: FormGroup;
  isSubmitting = false;
  today = new Date().toISOString().split('T')[0];

  // Team members
  searchQuery = '';
  searchResults: User[] = [];
  selectedMembers: User[] = [];

  constructor() {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      priority: ['', Validators.required],
      status: ['', Validators.required],
      startDate: [''],
      endDate: ['']
    }, { validators: this.dateRangeValidator });
  }

  ngOnInit() {
    // Set default values
    this.projectForm.patchValue({
      status: 'planning',
      priority: 'medium'
    });
  }

  // Custom validator for date range
  dateRangeValidator(group: FormGroup) {
    const startDate = group.get('startDate')?.value;
    const endDate = group.get('endDate')?.value;
    
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return { dateRange: true };
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.projectForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  async searchUsers() {
    if (this.searchQuery.length < 2) {
      this.searchResults = [];
      return;
    }

    try {
      const response = await this.http.get<User[]>(
        `${environment.apiUrl}/users/search?q=${encodeURIComponent(this.searchQuery)}`
      ).toPromise();

      if (response) {
        this.searchResults = response.filter(user => 
          !this.selectedMembers.some(member => member._id === user._id)
        );
      }
    } catch (error) {
      console.error('Error searching users:', error);
      this.searchResults = [];
    }
  }

  addMember(user: User) {
    if (!this.isMemberAdded(user._id)) {
      this.selectedMembers.push(user);
      this.searchResults = this.searchResults.filter(u => u._id !== user._id);
      this.searchQuery = '';
      this.searchResults = [];
    }
  }

  removeMember(userId: string) {
    this.selectedMembers = this.selectedMembers.filter(member => member._id !== userId);
  }

  isMemberAdded(userId: string): boolean {
    return this.selectedMembers.some(member => member._id === userId);
  }

  async onSubmit() {
    if (this.projectForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      try {
        const formValue = this.projectForm.value;
        const projectData: CreateProjectRequest = {
          name: formValue.name,
          description: formValue.description || undefined,
          members: this.selectedMembers.map(member => member._id),
          priority: formValue.priority,
          status: formValue.status,
          startDate: formValue.startDate ? new Date(formValue.startDate) : undefined,
          endDate: formValue.endDate ? new Date(formValue.endDate) : undefined
        };

        const response = await this.http.post(
          `${environment.apiUrl}/projects`,
          projectData
        ).toPromise();

        // Redirect to projects list or project detail
        this.router.navigate(['/projects']);
        
      } catch (error) {
        console.error('Error creating project:', error);
        // Here you could show a toast notification or error message
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  goBack() {
    this.router.navigate(['/projects']);
  }
}