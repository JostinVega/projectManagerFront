import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

interface Project {
  _id: string;
  name: string;
  description?: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  project: {
    _id: string;
    name: string;
  };
  assignedTo?: string;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

@Component({
  selector: 'app-task-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="task-edit-container">
      <!-- Loading State -->
      @if (isLoading) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading task...</p>
        </div>
      } @else {
        <!-- Header -->
        <div class="page-header">
          <div class="header-content">
            <button class="back-button" (click)="goBack()">
              <span class="material-icons">arrow_back</span>
              Back
            </button>
            <div class="header-title">
              <h1>Edit Task</h1>
              <p class="header-subtitle">Update task details and settings</p>
            </div>
          </div>
        </div>

        <!-- Form -->
        <div class="form-container">
          <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="task-form">
            <!-- Task Information Section -->
            <div class="form-section">
              <h2 class="section-title">
                <span class="material-icons">info</span>
                Task Information
              </h2>
              
              <div class="form-grid">
                <!-- Title -->
                <div class="form-group full-width">
                  <label for="title" class="form-label required">Task Title</label>
                  <input
                    type="text"
                    id="title"
                    formControlName="title"
                    class="form-control"
                    placeholder="Enter task title"
                    [class.error]="taskForm.get('title')?.invalid && taskForm.get('title')?.touched">
                  @if (taskForm.get('title')?.invalid && taskForm.get('title')?.touched) {
                    <span class="error-message">
                      <span class="material-icons">error</span>
                      Task title is required
                    </span>
                  }
                </div>

                <!-- Description -->
                <div class="form-group full-width">
                  <label for="description" class="form-label">Description</label>
                  <textarea
                    id="description"
                    formControlName="description"
                    class="form-control textarea"
                    placeholder="Enter task description (optional)"
                    rows="4"></textarea>
                </div>

                <!-- Project -->
                <div class="form-group">
                  <label for="project" class="form-label required">Project</label>
                  <select
                    id="project"
                    formControlName="project"
                    class="form-control"
                    [class.error]="taskForm.get('project')?.invalid && taskForm.get('project')?.touched">
                    <option value="">Select a project</option>
                    @for (project of projects; track project._id) {
                      <option [value]="project._id">{{ project.name }}</option>
                    }
                  </select>
                  @if (taskForm.get('project')?.invalid && taskForm.get('project')?.touched) {
                    <span class="error-message">
                      <span class="material-icons">error</span>
                      Please select a project
                    </span>
                  }
                </div>

                <!-- Status -->
                <div class="form-group">
                  <label for="status" class="form-label required">Status</label>
                  <select
                    id="status"
                    formControlName="status"
                    class="form-control">
                    <option value="pending">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Done</option>
                  </select>
                </div>

                <!-- Priority -->
                <div class="form-group">
                  <label for="priority" class="form-label">Priority</label>
                  <select
                    id="priority"
                    formControlName="priority"
                    class="form-control">
                    <option value="">No priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <!-- Assigned To -->
                <div class="form-group">
                  <label for="assignedTo" class="form-label">Assigned To</label>
                  <select
                    id="assignedTo"
                    formControlName="assignedTo"
                    class="form-control">
                    <option value="">Unassigned</option>
                    @for (user of users; track user._id) {
                      <option [value]="user._id">{{ user.firstName }} {{ user.lastName }}</option>
                    }
                  </select>
                </div>

                <!-- Due Date -->
                <div class="form-group">
                  <label for="dueDate" class="form-label">Due Date</label>
                  <input
                    type="date"
                    id="dueDate"
                    formControlName="dueDate"
                    class="form-control">
                </div>
              </div>
            </div>

            <!-- Task Status Section -->
            <div class="form-section">
              <h2 class="section-title">
                <span class="material-icons">timeline</span>
                Status & Progress
              </h2>
              
              <div class="status-cards">
                <div class="status-card" [class.active]="taskForm.get('status')?.value === 'pending'" (click)="setStatus('pending')">
                  <div class="status-icon todo">
                    <span class="material-icons">schedule</span>
                  </div>
                  <div class="status-content">
                    <h4>To Do</h4>
                    <p>Task is pending</p>
                  </div>
                </div>

                <div class="status-card" [class.active]="taskForm.get('status')?.value === 'in_progress'" (click)="setStatus('in_progress')">
                  <div class="status-icon inprogress">
                    <span class="material-icons">autorenew</span>
                  </div>
                  <div class="status-content">
                    <h4>In Progress</h4>
                    <p>Currently working on it</p>
                  </div>
                </div>

                <div class="status-card" [class.active]="taskForm.get('status')?.value === 'completed'" (click)="setStatus('completed')">
                  <div class="status-icon done">
                    <span class="material-icons">check_circle</span>
                  </div>
                  <div class="status-content">
                    <h4>Done</h4>
                    <p>Task completed</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Priority Section -->
            <div class="form-section">
              <h2 class="section-title">
                <span class="material-icons">flag</span>
                Priority Level
              </h2>
              
              <div class="priority-cards">
                <div class="priority-card low" [class.active]="taskForm.get('priority')?.value === 'low'" (click)="setPriority('low')">
                  <div class="priority-indicator"></div>
                  <span>Low Priority</span>
                </div>

                <div class="priority-card medium" [class.active]="taskForm.get('priority')?.value === 'medium'" (click)="setPriority('medium')">
                  <div class="priority-indicator"></div>
                  <span>Medium Priority</span>
                </div>

                <div class="priority-card high" [class.active]="taskForm.get('priority')?.value === 'high'" (click)="setPriority('high')">
                  <div class="priority-indicator"></div>
                  <span>High Priority</span>
                </div>

                <div class="priority-card none" [class.active]="!taskForm.get('priority')?.value" (click)="setPriority('')">
                  <div class="priority-indicator"></div>
                  <span>No Priority</span>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button type="button" class="btn btn-outline" (click)="goBack()">
                Cancel
              </button>
              <button type="button" class="btn btn-error-outline" (click)="deleteTask()" [disabled]="isSubmitting">
                <span class="material-icons">delete</span>
                Delete Task
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="taskForm.invalid || isSubmitting">
                @if (isSubmitting) {
                  <div class="btn-spinner"></div>
                  Saving...
                } @else {
                  <span class="material-icons">save</span>
                  Save Changes
                }
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
  styles: [`
    .task-edit-container {
      min-height: calc(100vh - 128px);
      background-color: var(--neutral-50);
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-8);
      color: var(--neutral-600);
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--neutral-200);
      border-top: 3px solid var(--primary-500);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: var(--space-3);
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .page-header {
      background: white;
      border-bottom: 1px solid var(--neutral-200);
      padding: var(--space-4) 0;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--space-4);
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .back-button {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      background: none;
      border: none;
      color: var(--neutral-600);
      cursor: pointer;
      padding: var(--space-1);
      border-radius: var(--border-radius-md);
      transition: all var(--transition-fast);
    }

    .back-button:hover {
      background-color: var(--neutral-100);
      color: var(--primary-600);
    }

    .header-title h1 {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--neutral-900);
      margin-bottom: var(--space-1);
    }

    .header-subtitle {
      color: var(--neutral-600);
      margin: 0;
    }

    .form-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--space-5) var(--space-4);
    }

    .task-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .form-section {
      background: white;
      border-radius: var(--border-radius-lg);
      padding: var(--space-4);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--neutral-200);
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--neutral-900);
      margin-bottom: var(--space-4);
      padding-bottom: var(--space-2);
      border-bottom: 1px solid var(--neutral-100);
    }

    .section-title .material-icons {
      color: var(--primary-600);
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--space-3);
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
      color: var(--neutral-800);
      margin-bottom: var(--space-1);
      font-size: var(--font-size-sm);
    }

    .form-label.required::after {
      content: ' *';
      color: var(--error-500);
    }

    .form-control {
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--neutral-300);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-md);
      transition: all var(--transition-fast);
      background-color: white;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px var(--primary-100);
    }

    .form-control.error {
      border-color: var(--error-500);
    }

    .form-control.error:focus {
      box-shadow: 0 0 0 3px var(--error-100);
    }

    .textarea {
      resize: vertical;
      min-height: 100px;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      color: var(--error-600);
      font-size: var(--font-size-sm);
      margin-top: var(--space-1);
    }

    .error-message .material-icons {
      font-size: 16px;
    }

    .status-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-3);
    }

    .status-card {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3);
      border: 2px solid var(--neutral-200);
      border-radius: var(--border-radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
      background: white;
    }

    .status-card:hover {
      border-color: var(--primary-300);
      background-color: var(--primary-50);
    }

    .status-card.active {
      border-color: var(--primary-500);
      background-color: var(--primary-50);
    }

    .status-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .status-icon.todo {
      background-color: var(--neutral-100);
      color: var(--neutral-600);
    }

    .status-icon.inprogress {
      background-color: var(--warning-100);
      color: var(--warning-600);
    }

    .status-icon.done {
      background-color: var(--success-100);
      color: var(--success-600);
    }

    .status-content h4 {
      font-weight: var(--font-weight-semibold);
      color: var(--neutral-900);
      margin-bottom: var(--space-1);
    }

    .status-content p {
      color: var(--neutral-600);
      font-size: var(--font-size-sm);
      margin: 0;
    }

    .priority-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--space-2);
    }

    .priority-card {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      border: 2px solid var(--neutral-200);
      border-radius: var(--border-radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
      background: white;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }

    .priority-card:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

    .priority-card.active {
      border-color: var(--primary-500);
      background-color: var(--primary-50);
    }

    .priority-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .priority-card.low .priority-indicator {
      background-color: var(--success-500);
    }

    .priority-card.medium .priority-indicator {
      background-color: var(--warning-500);
    }

    .priority-card.high .priority-indicator {
      background-color: var(--error-500);
    }

    .priority-card.none .priority-indicator {
      background-color: var(--neutral-400);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-2);
      padding: var(--space-4);
      background: white;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--neutral-200);
    }

    .btn-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-right: var(--space-1);
    }

    @media (max-width: 768px) {
      .form-container {
        padding: var(--space-3);
      }

      .header-content {
        padding: 0 var(--space-3);
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .status-cards {
        grid-template-columns: 1fr;
      }

      .priority-cards {
        grid-template-columns: repeat(2, 1fr);
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
export class TaskEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  taskForm: FormGroup;
  taskId: string = '';
  task: Task | null = null;
  projects: Project[] = [];
  users: User[] = [];
  isLoading = true;
  isSubmitting = false;

  constructor() {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      project: ['', [Validators.required]],
      status: ['pending', [Validators.required]],
      priority: [''],
      assignedTo: [''],
      dueDate: ['']
    });
  }

  ngOnInit() {
    this.taskId = this.route.snapshot.params['id'];
    this.loadData();
  }

  private async loadData() {
    try {
      this.isLoading = true;
      
      await Promise.all([
        this.loadTask(),
        this.loadProjects(),
        this.loadUsers()
      ]);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadTask() {
    try {
      const task = await this.http.get<Task>(
        `${environment.apiUrl}/tasks/${this.taskId}`
      ).toPromise();
      
      if (task) {
        this.task = task;
        this.populateForm(task);
      }
    } catch (error) {
      console.error('Error loading task:', error);
    }
  }

  private async loadProjects() {
    try {
      const projects = await this.http.get<Project[]>(
        `${environment.apiUrl}/projects`
      ).toPromise();
      
      if (projects) {
        this.projects = projects;
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }

  private async loadUsers() {
    try {
      const users = await this.http.get<User[]>(
        `${environment.apiUrl}/users`
      ).toPromise();
      
      if (users) {
        this.users = users;
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  private populateForm(task: Task) {
    this.taskForm.patchValue({
      title: task.title,
      description: task.description || '',
      project: task.project._id,
      status: task.status,
      priority: task.priority || '',
      assignedTo: task.assignedTo || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    });
  }

  setStatus(status: 'pending' | 'in_progress' | 'completed') {
    this.taskForm.patchValue({ status });
  }

  setPriority(priority: string) {
    this.taskForm.patchValue({ priority });
  }

  async onSubmit() {
    if (this.taskForm.valid && !this.isSubmitting) {
      try {
        this.isSubmitting = true;
        
        const formData = { ...this.taskForm.value };
        
        // Clean up empty values
        Object.keys(formData).forEach(key => {
          if (formData[key] === '') {
            formData[key] = null;
          }
        });

        await this.http.put(
          `${environment.apiUrl}/tasks/${this.taskId}`,
          formData
        ).toPromise();

        this.router.navigate(['/tasks']);
        
      } catch (error) {
        console.error('Error updating task:', error);
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  async deleteTask() {
    if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await this.http.delete(
          `${environment.apiUrl}/tasks/${this.taskId}`
        ).toPromise();

        this.router.navigate(['/tasks']);
        
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  }

  goBack() {
    this.router.navigate(['/tasks']);
  }
}