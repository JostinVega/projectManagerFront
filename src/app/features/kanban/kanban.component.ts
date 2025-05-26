import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';

interface Project {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
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
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  priority?: 'low' | 'medium' | 'high';
}

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="kanban-container">
      <!-- Header -->
      <div class="kanban-header">
        <div class="header-content">
          <h1 class="kanban-title">Kanban Board</h1>
          <p class="kanban-subtitle">Manage your tasks visually across different stages</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline" routerLink="/tasks/new">
            <span class="material-icons">add_task</span>
            New Task
          </button>
        </div>
      </div>

      <!-- Project Selector -->
      <div class="project-selector">
        <div class="selector-content">
          <label class="selector-label">
            <span class="material-icons">folder</span>
            Select Project:
          </label>
          <select 
            class="project-select" 
            [(ngModel)]="selectedProjectId" 
            (ngModelChange)="onProjectChange()"
            [disabled]="isLoadingProjects">
            <option value="">Choose a project...</option>
            @for (project of projects; track project._id) {
              <option [value]="project._id">{{ project.name }}</option>
            }
          </select>
        </div>
        @if (selectedProject) {
          <div class="project-info">
            <h3>{{ selectedProject.name }}</h3>
            @if (selectedProject.description) {
              <p>{{ selectedProject.description }}</p>
            }
          </div>
        }
      </div>

      <!-- Loading State -->
      @if (isLoadingTasks) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading tasks...</p>
        </div>
      }

      <!-- Error State -->
      @if (errorMessage) {
        <div class="error-container">
          <div class="error-icon">
            <span class="material-icons">error_outline</span>
          </div>
          <div class="error-content">
            <h3>Error Loading Tasks</h3>
            <p>{{ errorMessage }}</p>
            <button class="btn btn-primary" (click)="loadTasks()">
              Try Again
            </button>
          </div>
        </div>
      }

      <!-- Kanban Board -->
      @if (selectedProject && !isLoadingTasks && !errorMessage) {
        <div class="kanban-board">
          <!-- To Do Column -->
          <div class="kanban-column">
            <div class="column-header todo-header">
              <div class="column-title">
                <span class="material-icons">schedule</span>
                <h3>To Do</h3>
                <span class="task-count">{{ todoTasks.length }}</span>
              </div>
            </div>
            <div class="column-content" 
                 (dragover)="onDragOver($event)"
                 (dragleave)="onDragLeave($event)"
                 (drop)="onDrop($event, 'pending')">
              @if (todoTasks.length > 0) {
                @for (task of todoTasks; track task._id) {
                  <div class="task-card"
                       draggable="true"
                       (dragstart)="onDragStart($event, task)"
                       [routerLink]="['/tasks', task._id]">
                    <div class="task-header">
                      <h4 class="task-title">{{ task.title }}</h4>
                      @if (task.priority) {
                        <span class="task-priority" [class]="'priority-' + task.priority">
                          {{ task.priority }}
                        </span>
                      }
                    </div>
                    @if (task.description) {
                      <p class="task-description">{{ task.description }}</p>
                    }
                    <div class="task-footer">
                      @if (task.assignedTo) {
                        <div class="task-assignee">
                          <span class="assignee-avatar">
                            {{ getInitials(task.assignedTo.firstName, task.assignedTo.lastName) }}
                          </span>
                          <span class="assignee-name">
                            {{ task.assignedTo.firstName }} {{ task.assignedTo.lastName }}
                          </span>
                        </div>
                      }
                      @if (task.dueDate) {
                        <div class="task-due-date" [class.overdue]="isOverdue(task.dueDate)">
                          <span class="material-icons">schedule</span>
                          {{ formatDate(task.dueDate) }}
                        </div>
                      }
                    </div>
                  </div>
                }
              } @else {
                <div class="empty-column">
                  <span class="material-icons">schedule</span>
                  <p>No tasks in To Do</p>
                </div>
              }
            </div>
          </div>

          <!-- In Progress Column -->
          <div class="kanban-column">
            <div class="column-header inprogress-header">
              <div class="column-title">
                <span class="material-icons">autorenew</span>
                <h3>In Progress</h3>
                <span class="task-count">{{ inProgressTasks.length }}</span>
              </div>
            </div>
            <div class="column-content"
                 (dragover)="onDragOver($event)"
                 (dragleave)="onDragLeave($event)"
                 (drop)="onDrop($event, 'in_progress')">
              @if (inProgressTasks.length > 0) {
                @for (task of inProgressTasks; track task._id) {
                  <div class="task-card"
                       draggable="true"
                       (dragstart)="onDragStart($event, task)"
                       [routerLink]="['/tasks', task._id]">
                    <div class="task-header">
                      <h4 class="task-title">{{ task.title }}</h4>
                      @if (task.priority) {
                        <span class="task-priority" [class]="'priority-' + task.priority">
                          {{ task.priority }}
                        </span>
                      }
                    </div>
                    @if (task.description) {
                      <p class="task-description">{{ task.description }}</p>
                    }
                    <div class="task-footer">
                      @if (task.assignedTo) {
                        <div class="task-assignee">
                          <span class="assignee-avatar">
                            {{ getInitials(task.assignedTo.firstName, task.assignedTo.lastName) }}
                          </span>
                          <span class="assignee-name">
                            {{ task.assignedTo.firstName }} {{ task.assignedTo.lastName }}
                          </span>
                        </div>
                      }
                      @if (task.dueDate) {
                        <div class="task-due-date" [class.overdue]="isOverdue(task.dueDate)">
                          <span class="material-icons">schedule</span>
                          {{ formatDate(task.dueDate) }}
                        </div>
                      }
                    </div>
                  </div>
                }
              } @else {
                <div class="empty-column">
                  <span class="material-icons">autorenew</span>
                  <p>No tasks in progress</p>
                </div>
              }
            </div>
          </div>

          <!-- Done Column -->
          <div class="kanban-column">
            <div class="column-header done-header">
              <div class="column-title">
                <span class="material-icons">check_circle</span>
                <h3>Done</h3>
                <span class="task-count">{{ doneTasks.length }}</span>
              </div>
            </div>
            <div class="column-content"
                 (dragover)="onDragOver($event)"
                 (dragleave)="onDragLeave($event)"
                 (drop)="onDrop($event, 'completed')">
              @if (doneTasks.length > 0) {
                @for (task of doneTasks; track task._id) {
                  <div class="task-card completed"
                       draggable="true"
                       (dragstart)="onDragStart($event, task)"
                       [routerLink]="['/tasks', task._id]">
                    <div class="task-header">
                      <h4 class="task-title">{{ task.title }}</h4>
                      @if (task.priority) {
                        <span class="task-priority" [class]="'priority-' + task.priority">
                          {{ task.priority }}
                        </span>
                      }
                    </div>
                    @if (task.description) {
                      <p class="task-description">{{ task.description }}</p>
                    }
                    <div class="task-footer">
                      @if (task.assignedTo) {
                        <div class="task-assignee">
                          <span class="assignee-avatar">
                            {{ getInitials(task.assignedTo.firstName, task.assignedTo.lastName) }}
                          </span>
                          <span class="assignee-name">
                            {{ task.assignedTo.firstName }} {{ task.assignedTo.lastName }}
                          </span>
                        </div>
                      }
                      <div class="task-due-date">
                        <span class="material-icons">check</span>
                        Completed
                      </div>
                    </div>
                  </div>
                }
              } @else {
                <div class="empty-column">
                  <span class="material-icons">check_circle</span>
                  <p>No completed tasks</p>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- No Project Selected State -->
      @if (!selectedProject && !isLoadingProjects) {
        <div class="no-project-state">
          <div class="no-project-content">
            <span class="material-icons">folder_open</span>
            <h2>Select a Project</h2>
            <p>Choose a project from the dropdown above to view and manage its tasks on the Kanban board.</p>
            @if (projects.length === 0) {
              <button class="btn btn-primary" routerLink="/projects/new">
                Create Your First Project
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .kanban-container {
      padding: var(--space-4);
      max-width: 1400px;
      margin: 0 auto;
      min-height: calc(100vh - 200px);
    }

    .kanban-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-4);
      gap: var(--space-3);
    }

    .kanban-title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--neutral-900);
      margin-bottom: var(--space-1);
    }

    .kanban-subtitle {
      color: var(--neutral-600);
      font-size: var(--font-size-lg);
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: var(--space-2);
      flex-shrink: 0;
    }

    .project-selector {
      background: white;
      border-radius: var(--border-radius-lg);
      padding: var(--space-4);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--neutral-200);
      margin-bottom: var(--space-4);
    }

    .selector-content {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-3);
    }

    .selector-label {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      font-weight: var(--font-weight-medium);
      color: var(--neutral-700);
      flex-shrink: 0;
    }

    .project-select {
      flex: 1;
      max-width: 300px;
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--neutral-300);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-md);
      background: white;
    }

    .project-select:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px var(--primary-100);
    }

    .project-info h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--neutral-900);
      margin-bottom: var(--space-1);
    }

    .project-info p {
      color: var(--neutral-600);
      margin: 0;
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

    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-8);
      background: white;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--error-200);
      text-align: center;
    }

    .error-icon {
      color: var(--error-500);
      margin-bottom: var(--space-3);
    }

    .error-icon .material-icons {
      font-size: 48px;
    }

    .error-content h3 {
      color: var(--error-700);
      margin-bottom: var(--space-2);
    }

    .error-content p {
      color: var(--neutral-600);
      margin-bottom: var(--space-4);
    }

    .kanban-board {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-4);
      min-height: 600px;
    }

    .kanban-column {
      background: var(--neutral-50);
      border-radius: var(--border-radius-lg);
      display: flex;
      flex-direction: column;
      min-height: 600px;
    }

    .column-header {
      padding: var(--space-3);
      border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
    }

    .todo-header {
      background: var(--neutral-100);
      border-bottom: 2px solid var(--neutral-300);
    }

    .inprogress-header {
      background: var(--warning-100);
      border-bottom: 2px solid var(--warning-300);
    }

    .done-header {
      background: var(--success-100);
      border-bottom: 2px solid var(--success-300);
    }

    .column-title {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .column-title h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--neutral-800);
      margin: 0;
      flex: 1;
    }

    .task-count {
      background: var(--neutral-200);
      color: var(--neutral-700);
      padding: 2px 8px;
      border-radius: var(--border-radius-full);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }

    .inprogress-header .task-count {
      background: var(--warning-200);
      color: var(--warning-800);
    }

    .done-header .task-count {
      background: var(--success-200);
      color: var(--success-800);
    }

    .column-content {
      flex: 1;
      padding: var(--space-3);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      min-height: 300px;
      transition: all var(--transition-fast);
    }

    .column-content.drag-over {
      background-color: var(--primary-50);
      border: 2px dashed var(--primary-300);
      border-radius: var(--border-radius-md);
    }

    .task-card {
      background: white;
      border-radius: var(--border-radius-md);
      padding: var(--space-3);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--neutral-200);
      cursor: pointer;
      transition: all var(--transition-fast);
      text-decoration: none;
      color: inherit;
    }

    .task-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
      border-color: var(--primary-300);
    }

    .task-card.completed {
      opacity: 0.8;
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-2);
      gap: var(--space-2);
    }

    .task-title {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--neutral-900);
      margin: 0;
      flex: 1;
      line-height: 1.4;
    }

    .task-priority {
      padding: 2px 6px;
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      text-transform: uppercase;
      flex-shrink: 0;
    }

    .priority-low {
      background-color: var(--success-100);
      color: var(--success-700);
    }

    .priority-medium {
      background-color: var(--warning-100);
      color: var(--warning-700);
    }

    .priority-high {
      background-color: var(--error-100);
      color: var(--error-700);
    }

    .task-description {
      color: var(--neutral-600);
      font-size: var(--font-size-sm);
      line-height: 1.4;
      margin-bottom: var(--space-3);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .task-footer {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .task-assignee {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .assignee-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: var(--primary-100);
      color: var(--primary-700);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      flex-shrink: 0;
    }

    .assignee-name {
      font-size: var(--font-size-sm);
      color: var(--neutral-700);
    }

    .task-due-date {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      font-size: var(--font-size-xs);
      color: var(--neutral-600);
    }

    .task-due-date.overdue {
      color: var(--error-600);
      font-weight: var(--font-weight-medium);
    }

    .task-due-date .material-icons {
      font-size: 14px;
    }

    .empty-column {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-4);
      color: var(--neutral-500);
      text-align: center;
      flex: 1;
    }

    .empty-column .material-icons {
      font-size: 48px;
      margin-bottom: var(--space-2);
      opacity: 0.5;
    }

    .no-project-state {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      background: white;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--neutral-200);
    }

    .no-project-content {
      text-align: center;
      color: var(--neutral-600);
      max-width: 400px;
    }

    .no-project-content .material-icons {
      font-size: 64px;
      color: var(--neutral-400);
      margin-bottom: var(--space-3);
    }

    .no-project-content h2 {
      font-size: var(--font-size-xl);
      color: var(--neutral-900);
      margin-bottom: var(--space-2);
    }

    .no-project-content p {
      margin-bottom: var(--space-4);
      line-height: 1.6;
    }

    @media (max-width: 1024px) {
      .kanban-board {
        grid-template-columns: 1fr;
        gap: var(--space-3);
      }

      .kanban-column {
        min-height: auto;
      }
    }

    @media (max-width: 768px) {
      .kanban-container {
        padding: var(--space-3);
      }

      .kanban-header {
        flex-direction: column;
        align-items: stretch;
        gap: var(--space-3);
      }

      .selector-content {
        flex-direction: column;
        align-items: stretch;
        gap: var(--space-2);
      }

      .project-select {
        max-width: none;
      }

      .task-header {
        flex-direction: column;
        align-items: stretch;
        gap: var(--space-1);
      }

      .task-priority {
        align-self: flex-start;
      }
    }
  `]
})
export class KanbanComponent implements OnInit {
  http = inject(HttpClient);
  
  projects: Project[] = [];
  tasks: Task[] = [];
  selectedProjectId = '';
  selectedProject: Project | null = null;
  
  isLoadingProjects = true;
  isLoadingTasks = false;
  errorMessage = '';
  
  draggedTask: Task | null = null;

  get todoTasks(): Task[] {
  return this.tasks.filter(
    task => task.status === 'pending' && task.project._id === this.selectedProjectId
  );
}

get inProgressTasks(): Task[] {
  return this.tasks.filter(
    task => task.status === 'in_progress' && task.project._id === this.selectedProjectId
  );
}

get doneTasks(): Task[] {
  return this.tasks.filter(
    task => task.status === 'completed' && task.project._id === this.selectedProjectId
  );
}


  ngOnInit() {
    this.loadProjects();
  }

  private async loadProjects() {
    try {
      this.isLoadingProjects = true;
      this.errorMessage = '';
      
      const response = await this.http.get<Project[]>(`${environment.apiUrl}/projects`).toPromise();
      if (response) {
        this.projects = response;
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      this.errorMessage = 'Failed to load projects. Please try again.';
    } finally {
      this.isLoadingProjects = false;
    }
  }

  async onProjectChange() {
    if (this.selectedProjectId) {
      this.selectedProject = this.projects.find(p => p._id === this.selectedProjectId) || null;
      await this.loadTasks();
    } else {
      this.selectedProject = null;
      this.tasks = [];
      this.errorMessage = '';
    }
  }

  async loadTasks() {
    if (!this.selectedProjectId) return;
    
    try {
      this.isLoadingTasks = true;
      this.errorMessage = '';
      
      // Construir la URL con parámetros de consulta correctos
      const url = `${environment.apiUrl}/tasks`;
      const params = new URLSearchParams({
        project: this.selectedProjectId,
        populate: 'assignedTo,project'
      });
      
      console.log('Loading tasks with URL:', `${url}?${params.toString()}`);
      
      const response = await this.http.get<Task[]>(`${url}?${params.toString()}`).toPromise();
      
      if (response) {
        // Validar y limpiar los datos de las tareas
        this.tasks = response.map(task => this.validateTask(task)).filter(task => task !== null) as Task[];
        console.log('Loaded tasks:', this.tasks);
      } else {
        this.tasks = [];
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      this.errorMessage = 'Failed to load tasks for this project. Please try again.';
      this.tasks = [];
    } finally {
      this.isLoadingTasks = false;
    }
  }

  private validateTask(task: any): Task | null {
    try {
      // Validar que la tarea tenga los campos requeridos
      if (!task._id || !task.title || !task.status) {
        console.warn('Invalid task data:', task);
        return null;
      }

      // Asegurar que project esté presente
      if (!task.project || !task.project._id) {
        console.warn('Task without valid project:', task);
        return null;
      }

      // Validar assignedTo si existe
      if (task.assignedTo) {
        if (!task.assignedTo.firstName || !task.assignedTo.lastName) {
          console.warn('Task with invalid assignedTo data:', task);
          // No retornar null, solo limpiar assignedTo
          task.assignedTo = null;
        }
      }

      // Asegurar que las fechas sean válidas
      if (task.dueDate) {
        task.dueDate = new Date(task.dueDate);
        if (isNaN(task.dueDate.getTime())) {
          task.dueDate = null;
        }
      }

      if (task.createdAt) {
        task.createdAt = new Date(task.createdAt);
      }

      if (task.updatedAt) {
        task.updatedAt = new Date(task.updatedAt);
      }

      return task as Task;
    } catch (error) {
      console.error('Error validating task:', error, task);
      return null;
    }
  }

  getInitials(firstName?: string, lastName?: string): string {
    try {
      if (!firstName && !lastName) return '??';
      
      const first = firstName ? firstName.charAt(0).toUpperCase() : '';
      const last = lastName ? lastName.charAt(0).toUpperCase() : '';
      
      return first + last || '??';
    } catch (error) {
      console.error('Error getting initials:', error);
      return '??';
    }
  }

  onDragStart(event: DragEvent, task: Task) {
    this.draggedTask = task;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', task._id);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    
    // Add visual feedback
    const target = event.currentTarget as HTMLElement;
    target.classList.add('drag-over');
  }

  onDragLeave(event: DragEvent) {
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('drag-over');
  }

    async onDrop(event: DragEvent, newStatus: 'pending' | 'in_progress' | 'completed') {
    event.preventDefault();

    // Remove visual feedback
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('drag-over');

    if (!this.draggedTask || this.draggedTask.status === newStatus) {
      this.draggedTask = null;
      return;
    }

    try {
      // Actualizar el estado de la tarea en el backend
      await this.http.patch(`${environment.apiUrl}/tasks/${this.draggedTask._id}`, {
        status: newStatus
      }).toPromise();

      // Actualizar el estado local
      const index = this.tasks.findIndex(t => t._id === this.draggedTask!._id);
      if (index !== -1) {
        this.tasks[index].status = newStatus;
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      // Aquí podrías mostrar un mensaje de error al usuario si quieres
    } finally {
      this.draggedTask = null;
    }
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffTime = dateObj.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `in ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  }

  isOverdue(dueDate: Date | string): boolean {
    const dateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    return dateObj < new Date();
  }
}