import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

interface Project {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  members: string[];
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

@Component({
  selector: 'app-task-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="task-create">
      <div class="page-header">
        <div class="breadcrumb">
          <a routerLink="/dashboard" class="breadcrumb-link">Dashboard</a>
          <span class="breadcrumb-separator">
            <span class="material-icons">chevron_right</span>
          </span>
          <a routerLink="/tasks" class="breadcrumb-link">Tasks</a>
          <span class="breadcrumb-separator">
            <span class="material-icons">chevron_right</span>
          </span>
          <span class="breadcrumb-current">New Task</span>
        </div>
        
        <div class="page-title-section">
          <div class="page-icon">
            <span class="material-icons">add_task</span>
          </div>
          <div>
            <h1 class="page-title">Create New Task</h1>
            <p class="page-subtitle">Add a new task to organize your work</p>
          </div>
        </div>
      </div>

      <div class="task-create-content">
        <div class="create-form-container">
          <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="task-form">
            <!-- Task Basic Info -->
            <div class="form-section">
              <h3 class="section-title">
                <span class="material-icons">info</span>
                Basic Information
              </h3>
              
              <div class="form-group">
                <label for="title" class="form-label required">Task Title</label>
                <input
                  type="text"
                  id="title"
                  formControlName="title"
                  class="form-input"
                  [class.error]="isFieldInvalid('title')"
                  placeholder="Enter task title...">
                @if (isFieldInvalid('title')) {
                  <div class="form-error">
                    <span class="material-icons">error</span>
                    <span>Task title is required</span>
                  </div>
                }
              </div>

              <div class="form-group">
                <label for="description" class="form-label">Description</label>
                <textarea
                  id="description"
                  formControlName="description"
                  class="form-textarea"
                  rows="4"
                  placeholder="Describe what needs to be done..."></textarea>
              </div>
            </div>

            <!-- Task Assignment -->
            <div class="form-section">
              <h3 class="section-title">
                <span class="material-icons">assignment</span>
                Assignment & Project
              </h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="project" class="form-label required">Project</label>
                  <select
                    id="project"
                    formControlName="project"
                    class="form-select"
                    [class.error]="isFieldInvalid('project')"
                    (change)="onProjectChange()">
                    <option value="">Select a project...</option>
                    @for (project of projects; track project._id) {
                      <option [value]="project._id">{{ project.name }}</option>
                    }
                  </select>
                  @if (isFieldInvalid('project')) {
                    <div class="form-error">
                      <span class="material-icons">error</span>
                      <span>Please select a project</span>
                    </div>
                  }
                </div>

                <div class="form-group">
                  <label for="assignedTo" class="form-label">Assign To</label>
                  <select
                    id="assignedTo"
                    formControlName="assignedTo"
                    class="form-select"
                    [disabled]="!taskForm.get('project')?.value">
                    <option value="">Unassigned</option>
                    @for (member of projectMembers; track member._id) {
                      <option [value]="member._id">{{ member.firstName }} {{ member.lastName }}</option>
                    }
                  </select>
                  @if (!taskForm.get('project')?.value) {
                    <div class="form-hint">
                      <span class="material-icons">info</span>
                      Select a project first to see available members
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Task Details -->
            <div class="form-section">
              <h3 class="section-title">
                <span class="material-icons">tune</span>
                Task Details
              </h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="status" class="form-label">Status</label>
                  <select id="status" formControlName="status" class="form-select">
                    <option value="pending">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Done</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="priority" class="form-label">Priority</label>
                  <select id="priority" formControlName="priority" class="form-select">
                    <option value="">No Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label for="dueDate" class="form-label">Due Date</label>
                <input
                  type="datetime-local"
                  id="dueDate"
                  formControlName="dueDate"
                  class="form-input">
                <div class="form-hint">
                  <span class="material-icons">info</span>
                  Leave empty if no due date is required
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button
                type="button"
                class="btn btn-outline"
                routerLink="/tasks"
                [disabled]="isSubmitting">
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="taskForm.invalid || isSubmitting">
                @if (isSubmitting) {
                  <span class="btn-spinner"></span>
                  Creating...
                } @else {
                  <span class="material-icons">add_task</span>
                  Create Task
                }
              </button>
            </div>
          </form>
        </div>

        <!-- Side Panel -->
        <div class="side-panel">
          <div class="panel-card">
            <div class="panel-header">
              <span class="material-icons">tips_and_updates</span>
              <h4>Task Creation Tips</h4>
            </div>
            <div class="panel-content">
              <ul class="tips-list">
                <li>
                  <span class="material-icons">check_circle</span>
                  Use clear, descriptive titles
                </li>
                <li>
                  <span class="material-icons">check_circle</span>
                  Break large tasks into smaller ones
                </li>
                <li>
                  <span class="material-icons">check_circle</span>
                  Set realistic due dates
                </li>
                <li>
                  <span class="material-icons">check_circle</span>
                  Assign tasks to team members
                </li>
                <li>
                  <span class="material-icons">check_circle</span>
                  Use priority levels wisely
                </li>
              </ul>
            </div>
          </div>

          <div class="panel-card">
            <div class="panel-header">
              <span class="material-icons">keyboard_shortcuts</span>
              <h4>Keyboard Shortcuts</h4>
            </div>
            <div class="panel-content">
              <div class="shortcut-list">
                <div class="shortcut-item">
                  <kbd>Ctrl + Enter</kbd>
                  <span>Create task</span>
                </div>
                <div class="shortcut-item">
                  <kbd>Esc</kbd>
                  <span>Cancel</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .task-create {
      padding: var(--space-4);
      max-width: 1400px;
      margin: 0 auto;
      min-height: calc(100vh - 200px);
    }

    .page-header {
      margin-bottom: var(--space-5);
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      margin-bottom: var(--space-3);
      font-size: var(--font-size-sm);
    }

    .breadcrumb-link {
      color: var(--primary-600);
      text-decoration: none;
      transition: color var(--transition-fast);
    }

    .breadcrumb-link:hover {
      color: var(--primary-700);
    }

    .breadcrumb-separator {
      color: var(--neutral-400);
      display: flex;
      align-items: center;
    }

    .breadcrumb-separator .material-icons {
      font-size: 16px;
    }

    .breadcrumb-current {
      color: var(--neutral-600);
    }

    .page-title-section {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .page-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
      border-radius: var(--border-radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .page-icon .material-icons {
      font-size: 28px;
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

    .task-create-content {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: var(--space-5);
    }

    .create-form-container {
      background: white;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--neutral-200);
      overflow: hidden;
    }

    .task-form {
      padding: var(--space-5);
    }

    .form-section {
      margin-bottom: var(--space-5);
    }

    .form-section:last-child {
      margin-bottom: 0;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--neutral-900);
      margin-bottom: var(--space-4);
    }

    .section-title .material-icons {
      color: var(--primary-600);
    }

    .form-group {
      margin-bottom: var(--space-4);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-3);
    }

    .form-label {
      display: block;
      font-weight: var(--font-weight-medium);
      color: var(--neutral-900);
      margin-bottom: var(--space-2);
    }

    .form-label.required::after {
      content: ' *';
      color: var(--error-500);
    }

    .form-input,
    .form-textarea,
    .form-select {
      width: 100%;
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--neutral-300);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-md);
      transition: all var(--transition-fast);
      background-color: white;
    }

    .form-input:focus,
    .form-textarea:focus,
    .form-select:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px var(--primary-100);
    }

    .form-input.error,
    .form-textarea.error,
    .form-select.error {
      border-color: var(--error-500);
    }

    .form-input.error:focus,
    .form-textarea.error:focus,
    .form-select.error:focus {
      box-shadow: 0 0 0 3px var(--error-100);
    }

    .form-textarea {
      resize: vertical;
      min-height: 100px;
    }

    .form-select:disabled {
      background-color: var(--neutral-100);
      color: var(--neutral-500);
      cursor: not-allowed;
    }

    .form-error {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      color: var(--error-600);
      font-size: var(--font-size-sm);
      margin-top: var(--space-1);
    }

    .form-error .material-icons {
      font-size: 16px;
    }

    .form-hint {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      color: var(--neutral-500);
      font-size: var(--font-size-sm);
      margin-top: var(--space-1);
    }

    .form-hint .material-icons {
      font-size: 16px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-2);
      padding-top: var(--space-4);
      border-top: 1px solid var(--neutral-200);
      margin-top: var(--space-5);
    }

    .btn-spinner {
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

    .side-panel {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .panel-card {
      background: white;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--neutral-200);
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-4);
      background-color: var(--neutral-50);
      border-bottom: 1px solid var(--neutral-200);
    }

    .panel-header .material-icons {
      color: var(--primary-600);
    }

    .panel-header h4 {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--neutral-900);
      margin: 0;
    }

    .panel-content {
      padding: var(--space-4);
    }

    .tips-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .tips-list li {
      display: flex;
      align-items: flex-start;
      gap: var(--space-2);
      margin-bottom: var(--space-2);
      font-size: var(--font-size-sm);
      color: var(--neutral-700);
    }

    .tips-list li:last-child {
      margin-bottom: 0;
    }

    .tips-list .material-icons {
      color: var(--success-600);
      font-size: 16px;
      margin-top: 2px;
    }

    .shortcut-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .shortcut-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: var(--font-size-sm);
    }

    kbd {
      background-color: var(--neutral-100);
      border: 1px solid var(--neutral-300);
      border-radius: var(--border-radius-sm);
      padding: 2px 6px;
      font-size: var(--font-size-xs);
      font-family: monospace;
    }

    @media (max-width: 1024px) {
      .task-create-content {
        grid-template-columns: 1fr;
        gap: var(--space-4);
      }

      .side-panel {
        order: -1;
      }
    }

    @media (max-width: 768px) {
      .task-create {
        padding: var(--space-3);
      }

      .page-title-section {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-2);
      }

      .page-icon {
        width: 48px;
        height: 48px;
      }

      .page-icon .material-icons {
        font-size: 24px;
      }

      .task-form {
        padding: var(--space-4);
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: var(--space-2);
      }

      .form-actions {
        flex-direction: column;
      }

      .form-actions .btn {
        width: 100%;
      }
    }
  `]
})
export class TaskCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  taskForm: FormGroup;
  projects: Project[] = [];
  projectMembers: User[] = [];
  isSubmitting = false;

  constructor() {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      project: ['', Validators.required],
      assignedTo: [''],
      status: ['pending'],
      priority: [''],
      dueDate: ['']
    });
  }

  ngOnInit() {
    this.loadProjects();
    this.setupKeyboardShortcuts();
  }

  private async loadProjects() {
    try {
      const response = await this.http.get<Project[]>(
        `${environment.apiUrl}/projects`
      ).toPromise();
      
      if (response) {
        this.projects = response;
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }

  async onProjectChange() {
    const projectId = this.taskForm.get('project')?.value;
    if (!projectId) {
      this.projectMembers = [];
      this.taskForm.get('assignedTo')?.setValue('');
      return;
    }

    try {
      const response = await this.http.get<User[]>(
        `${environment.apiUrl}/projects/${projectId}/members`
      ).toPromise();
      
      if (response) {
        this.projectMembers = response;
      }
    } catch (error) {
      console.error('Error loading project members:', error);
      this.projectMembers = [];
    }
  }

  async onSubmit() {
    if (this.taskForm.invalid) return;

    this.isSubmitting = true;
    
    try {
      const formData = { ...this.taskForm.value };
      
      // Convert empty strings to null for optional fields
      if (!formData.assignedTo) formData.assignedTo = null;
      if (!formData.priority) formData.priority = null;
      if (!formData.dueDate) formData.dueDate = null;
      
      await this.http.post(
        `${environment.apiUrl}/tasks`, 
        formData
      ).toPromise();
      
      // Navigate back to tasks list
      this.router.navigate(['/tasks']);
      
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.taskForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        if (this.taskForm.valid && !this.isSubmitting) {
          this.onSubmit();
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        this.router.navigate(['/tasks']);
      }
    });
  }
}