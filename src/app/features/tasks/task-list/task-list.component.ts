import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Task {
  _id: string;
  id: string;
  taskId: string;
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
    email: string;
  };
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  priority?: 'low' | 'medium' | 'high';
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

interface Project {
  _id: string;
  name: string;
  description?: string;
}

interface TaskFilters {
  status: string;
  priority: string;
  project: string;
  assignedTo: string;
  search: string;
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="tasks-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title">Tasks</h1>
            <p class="page-subtitle">Manage and track all your tasks across projects</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-outline" (click)="refreshTasks()">
              <span class="material-icons">refresh</span>
              Refresh
            </button>
            <button class="btn btn-primary" routerLink="/tasks/new">
              <span class="material-icons">add</span>
              New Task
            </button>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filters-content">
          <div class="search-filter">
            <div class="search-input-group">
              <span class="material-icons">search</span>
              <input 
                type="text" 
                placeholder="Search tasks..." 
                [(ngModel)]="filters.search"
                (input)="onFilterChange()"
                class="search-input">
            </div>
          </div>
          
          <div class="filter-controls">
            <select [(ngModel)]="filters.status" (change)="onFilterChange()" class="filter-select">
              <option value="">All Status</option>
              <option value="pending">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Done</option>
            </select>

            <select [(ngModel)]="filters.priority" (change)="onFilterChange()" class="filter-select">
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select [(ngModel)]="filters.project" (change)="onFilterChange()" class="filter-select">
              <option value="">All Projects</option>
              @for (project of projects; track project._id) {
                <option [value]="project._id">{{ project.name }}</option>
              }
            </select>

            @if (filters.search || filters.status || filters.priority || filters.project) {
              <button class="btn btn-ghost" (click)="clearFilters()">
                <span class="material-icons">clear</span>
                Clear
              </button>
            }
          </div>
        </div>
      </div>

      <!-- View Toggle -->
      <div class="view-toggle">
        <div class="view-options">
          <button 
            class="view-btn" 
            [class.active]="currentView === 'list'"
            (click)="setView('list')">
            <span class="material-icons">view_list</span>
            List
          </button>
          <button 
            class="view-btn" 
            [class.active]="currentView === 'grid'"
            (click)="setView('grid')">
            <span class="material-icons">grid_view</span>
            Grid
          </button>
        </div>
        
        <div class="results-info">
          <span class="results-count">{{ filteredTasks.length }} of {{ tasks.length }} tasks</span>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading tasks...</p>
        </div>
      } @else {
        <!-- Tasks Content -->
        @if (filteredTasks.length > 0) {
          <div class="tasks-container" [class]="'view-' + currentView">
            @for (task of filteredTasks; track task._id) {
              <div class="task-card" [routerLink]="['/tasks', task._id]">
                <div class="task-header">
                  <div class="task-status-indicator" [class]="'status-' + task.status">
                    <span class="material-icons">{{ getTaskStatusIcon(task.status) }}</span>
                  </div>
                  
                  @if (task.priority) {
                    <span class="task-priority" [class]="'priority-' + task.priority">
                      {{ task.priority }}
                    </span>
                  }
                </div>

                <div class="task-content">
                  <h3 class="task-title">{{ task.title }}</h3>
                  @if (task.description) {
                    <p class="task-description">{{ task.description }}</p>
                  }
                  
                  <div class="task-project">
                    <span class="material-icons">folder</span>
                    {{ task.project.name }}
                  </div>
                </div>

                <div class="task-footer">
                  <div class="task-assignee">
                    @if (task.assignedTo) {
                      <div class="assignee-avatar">
                        {{ (task.assignedTo?.firstName?.charAt(0) || '') + (task.assignedTo?.lastName?.charAt(0) || '') }}
                      </div>
                      <span class="assignee-name">{{ task.assignedTo.firstName }} {{ task.assignedTo.lastName }}</span>
                    } @else {
                      <div class="assignee-avatar unassigned">
                        <span class="material-icons">person_outline</span>
                      </div>
                      <span class="assignee-name text-muted">Unassigned</span>
                    }
                  </div>
                  
                  @if (task.dueDate) {
                    <div class="task-due-date" [class.overdue]="isOverdue(task.dueDate)">
                      <span class="material-icons">schedule</span>
                      {{ formatDate(task.dueDate) }}
                    </div>
                  }
                </div>

                <div class="task-actions">
                  <button class="task-action-btn" (click)="toggleTaskStatus(task, $event)">
                    <span class="material-icons">
                      {{ task.status === 'completed' ? 'undo' : 'check' }}
                    </span>
                  </button>
                </div>
              </div>
            }
          </div>
        } @else {
          <!-- Empty State -->
          <div class="empty-state">
            @if (hasActiveFilters()) {
              <span class="material-icons">search_off</span>
              <h3>No tasks match your filters</h3>
              <p>Try adjusting your search criteria or clearing the filters.</p>
              <button class="btn btn-outline" (click)="clearFilters()">Clear Filters</button>
            } @else {
              <span class="material-icons">task_alt</span>
              <h3>No tasks yet</h3>
              <p>Create your first task to start organizing your work.</p>
              <button class="btn btn-primary" routerLink="/tasks/new">Create Task</button>
            }
          </div>
        }
      }

      <!-- Quick Stats -->
      <div class="quick-stats">
        <div class="stat-item">
          <span class="stat-number">{{ getTasksByStatus('pending').length }}</span>
          <span class="stat-label">To Do</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ getTasksByStatus('in_progress').length }}</span>
          <span class="stat-label">In Progress</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ getTasksByStatus('completed').length }}</span>
          <span class="stat-label">Completed</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ getOverdueTasks().length }}</span>
          <span class="stat-label">Overdue</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tasks-page {
      padding: var(--space-4);
      max-width: 1400px;
      margin: 0 auto;
      min-height: calc(100vh - 200px);
    }

    .page-header {
      margin-bottom: var(--space-4);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-3);
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

    .header-actions {
      display: flex;
      gap: var(--space-2);
      flex-shrink: 0;
    }

    .filters-section {
      background: white;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--neutral-200);
      margin-bottom: var(--space-4);
      padding: var(--space-3);
    }

    .filters-content {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      align-items: center;
    }

    .search-filter {
      flex: 1;
      min-width: 300px;
    }

    .search-input-group {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-input-group .material-icons {
      position: absolute;
      left: var(--space-2);
      color: var(--neutral-500);
      z-index: 1;
    }

    .search-input {
      width: 100%;
      padding: var(--space-2) var(--space-2) var(--space-2) var(--space-5);
      border: 1px solid var(--neutral-300);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-md);
    }

    .search-input:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px var(--primary-100);
    }

    .filter-controls {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .filter-select {
      padding: var(--space-2);
      border: 1px solid var(--neutral-300);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-sm);
      min-width: 120px;
    }

    .filter-select:focus {
      outline: none;
      border-color: var(--primary-500);
    }

    .view-toggle {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-4);
    }

    .view-options {
      display: flex;
      gap: var(--space-1);
      background: var(--neutral-100);
      border-radius: var(--border-radius-md);
      padding: 2px;
    }

    .view-btn {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      padding: var(--space-1) var(--space-2);
      border: none;
      background: transparent;
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      font-size: var(--font-size-sm);
      color: var(--neutral-600);
      transition: all var(--transition-fast);
    }

    .view-btn.active {
      background: white;
      color: var(--primary-600);
      box-shadow: var(--shadow-sm);
    }

    .results-info {
      color: var(--neutral-600);
      font-size: var(--font-size-sm);
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

    .tasks-container {
      margin-bottom: var(--space-5);
    }

    .tasks-container.view-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .tasks-container.view-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: var(--space-3);
    }

    .task-card {
      background: white;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--neutral-200);
      padding: var(--space-3);
      cursor: pointer;
      transition: all var(--transition-fast);
      position: relative;
    }

    .task-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: var(--primary-300);
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-2);
    }

    .task-status-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }

    .status-todo {
      background-color: var(--neutral-100);
      color: var(--neutral-600);
    }

    .status-inprogress {
      background-color: var(--warning-100);
      color: var(--warning-600);
    }

    .status-done {
      background-color: var(--success-100);
      color: var(--success-600);
    }

    .task-priority {
      padding: 2px 8px;
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      text-transform: uppercase;
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

    .task-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--neutral-900);
      margin-bottom: var(--space-1);
    }

    .task-description {
      color: var(--neutral-600);
      font-size: var(--font-size-sm);
      margin-bottom: var(--space-2);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .task-project {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      color: var(--primary-600);
      font-size: var(--font-size-sm);
      margin-bottom: var(--space-3);
    }

    .task-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-2);
    }

    .task-assignee {
      display: flex;
      align-items: center;
      gap: var(--space-1);
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
    }

    .assignee-avatar.unassigned {
      background-color: var(--neutral-100);
      color: var(--neutral-500);
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
    }

    .task-actions {
      display: flex;
      gap: var(--space-1);
      position: absolute;
      top: var(--space-2);
      right: var(--space-2);
      opacity: 0;
      transition: opacity var(--transition-fast);
    }

    .task-card:hover .task-actions {
      opacity: 1;
    }

    .task-action-btn {
      width: 28px;
      height: 28px;
      border: none;
      background-color: var(--neutral-100);
      color: var(--neutral-600);
      border-radius: var(--border-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .task-action-btn:hover {
      background-color: var(--primary-100);
      color: var(--primary-600);
    }

    .task-action-btn .material-icons {
      font-size: 16px;
    }

    .empty-state {
      text-align: center;
      padding: var(--space-8) var(--space-3);
      color: var(--neutral-600);
    }

    .empty-state .material-icons {
      font-size: 64px;
      color: var(--neutral-400);
      margin-bottom: var(--space-3);
    }

    .empty-state h3 {
      color: var(--neutral-800);
      margin-bottom: var(--space-2);
    }

    .empty-state p {
      margin-bottom: var(--space-4);
    }

    .quick-stats {
      display: flex;
      justify-content: center;
      gap: var(--space-4);
      padding: var(--space-3);
      background: white;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--neutral-200);
    }

    .stat-item {
      text-align: center;
    }

    .stat-number {
      display: block;
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--primary-600);
      margin-bottom: var(--space-1);
    }

    .stat-label {
      font-size: var(--font-size-sm);
      color: var(--neutral-600);
    }

    @media (max-width: 768px) {
      .tasks-page {
        padding: var(--space-3);
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: var(--space-3);
      }

      .header-actions {
        justify-content: stretch;
      }

      .header-actions .btn {
        flex: 1;
      }

      .filters-content {
        flex-direction: column;
        align-items: stretch;
      }

      .search-filter {
        min-width: auto;
      }

      .filter-controls {
        justify-content: stretch;
      }

      .filter-select {
        flex: 1;
        min-width: auto;
      }

      .view-toggle {
        flex-direction: column;
        gap: var(--space-2);
        align-items: stretch;
      }

      .tasks-container.view-grid {
        grid-template-columns: 1fr;
      }

      .quick-stats {
        flex-wrap: wrap;
        gap: var(--space-2);
      }

      .stat-item {
        flex: 1;
        min-width: 80px;
      }
    }
  `]
})
export class TasksComponent implements OnInit {
  authService = inject(AuthService);
  http = inject(HttpClient);

  tasks: Task[] = [];
  projects: Project[] = [];
  filteredTasks: Task[] = [];
  isLoading = true;
  currentView: 'list' | 'grid' = 'grid';

  filters: TaskFilters = {
    status: '',
    priority: '',
    project: '',
    assignedTo: '',
    search: ''
  };

  ngOnInit() {
    this.loadData();
  }

  private async loadData() {
    try {
      this.isLoading = true;
      
      await Promise.all([
        this.loadTasks(),
        this.loadProjects()
      ]);
      
      this.applyFilters();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadTasks() {
    try {
      // CAMBIO: La URL ahora es limpia, sin '?populate' ni '?sort'
      const response = await this.http.get<Task[]>(
        `${environment.apiUrl}/tasks`
      ).toPromise();
      
      if (response) {
        // CAMBIO: Ordenamos las tareas aquí, en el frontend, después de recibirlas
        this.tasks = response.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
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

  onFilterChange() {
    this.applyFilters();
  }

  private applyFilters() {
    this.filteredTasks = this.tasks.filter(task => {
      const matchesSearch = !this.filters.search || 
        task.title.toLowerCase().includes(this.filters.search.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(this.filters.search.toLowerCase()));
      
      const matchesStatus = !this.filters.status || task.status === this.filters.status;
      const matchesPriority = !this.filters.priority || task.priority === this.filters.priority;
      
      // CAMBIO: Comparamos directamente el string del ID del proyecto
      const matchesProject = !this.filters.project || task.project._id === this.filters.project;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    });
  }

  clearFilters() {
    this.filters = {
      status: '',
      priority: '',
      project: '',
      assignedTo: '',
      search: ''
    };
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.search || this.filters.status || this.filters.priority || this.filters.project);
  }

  setView(view: 'list' | 'grid') {
    this.currentView = view;
  }

  refreshTasks() {
    this.loadData();
  }

  getTaskStatusIcon(status: 'pending' | 'in_progress' | 'completed'): string {
    switch(status) {
      case 'pending': return 'schedule';
      case 'in_progress': return 'autorenew';
      case 'completed': return 'check_circle';
      default: return 'help_outline';
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

  getTasksByStatus(status: string): Task[] {
    return this.tasks.filter(task => task.status === status);
  }

  getOverdueTasks(): Task[] {
    return this.tasks.filter(task => task.dueDate && this.isOverdue(task.dueDate));
  }

  async toggleTaskStatus(task: Task, event: Event) {
    event.stopPropagation();
    
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      
      // CAMBIO: Usamos el método 'put' y el identificador 'task.taskId'
      await this.http.put(
        `${environment.apiUrl}/tasks/${task.taskId}`,
        { status: newStatus }
      ).toPromise();
      
      task.status = newStatus;
      this.applyFilters();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  }
}