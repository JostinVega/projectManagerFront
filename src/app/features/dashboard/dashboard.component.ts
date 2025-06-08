import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface DashboardStats {
  totalProjects: number;
  activeTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

interface Project {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
  taskCount?: number;
  completedTaskCount?: number;
  progress?: number;
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
  createdAt: Date;
  updatedAt: Date;
  priority?: 'low' | 'medium' | 'high';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1 class="dashboard-title">Welcome back, {{ userName }}!</h1>
          <p class="dashboard-subtitle">Here's what's happening with your projects today.</p>
        </div>
        <div class="dashboard-actions">
          <button class="btn btn-outline" routerLink="/projects/new">
            <span class="material-icons">add</span>
            New Project
          </button>
          <button class="btn btn-primary" routerLink="/tasks/new">
            <span class="material-icons">add_task</span>
            New Task
          </button>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      } @else {
        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card stat-primary">
            <div class="stat-icon">
              <span class="material-icons">folder</span>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ stats.totalProjects }}</h3>
              <p class="stat-label">Total Projects</p>
            </div>
          </div>

          <div class="stat-card stat-warning">
            <div class="stat-icon">
              <span class="material-icons">task_alt</span>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ stats.activeTasks }}</h3>
              <p class="stat-label">Active Tasks</p>
            </div>
          </div>

          <div class="stat-card stat-success">
            <div class="stat-icon">
              <span class="material-icons">check_circle</span>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ stats.completedTasks }}</h3>
              <p class="stat-label">Completed Tasks</p>
            </div>
          </div>

          <div class="stat-card stat-error">
            <div class="stat-icon">
              <span class="material-icons">schedule</span>
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ stats.overdueTasks }}</h3>
              <p class="stat-label">Overdue Tasks</p>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="content-grid">
          <!-- Recent Projects -->
          <div class="dashboard-card">
            <div class="card-header">
              <h2 class="card-title">Recent Projects</h2>
              <a routerLink="/projects" class="card-action">View all</a>
            </div>
            <div class="card-content">
              @if (recentProjects.length > 0) {
                <div class="project-list">
                  @for (project of recentProjects; track project._id) {
                    <div class="project-item" [routerLink]="['/projects', project._id]">
                      <div class="project-info">
                        <h4 class="project-name">{{ project.name }}</h4>
                        <p class="project-description">{{ project.description || 'No description available' }}</p>
                        <div class="project-meta">
                          <span class="project-members">
                            <span class="material-icons">group</span>
                            {{ project.members.length }} member{{ project.members.length === 1 ? '' : 's' }}
                          </span>
                          <span class="project-created">
                            <span class="material-icons">schedule</span>
                            Created {{ formatDate(project.createdAt) }}
                          </span>
                        </div>
                      </div>
                      <div class="project-progress">
                        <div class="progress-circle">
                          <svg class="progress-ring" width="60" height="60">
                            <circle
                              class="progress-ring-circle"
                              stroke="var(--neutral-200)"
                              stroke-width="4"
                              fill="transparent"
                              r="26"
                              cx="30"
                              cy="30"/>
                            <circle
                              class="progress-ring-circle progress-ring-fill"
                              stroke="var(--primary-500)"
                              stroke-width="4"
                              fill="transparent"
                              r="26"
                              cx="30"
                              cy="30"
                              [style.stroke-dasharray]="163.36"
                              [style.stroke-dashoffset]="163.36 - (163.36 * (project.progress || 0)) / 100"/>
                          </svg>
                          <span class="progress-text">{{ project.progress || 0 }}%</span>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="empty-state">
                  <span class="material-icons">folder_open</span>
                  <p>No projects yet. Create your first project to get started!</p>
                  <button class="btn btn-primary" routerLink="/projects/new">Create Project</button>
                </div>
              }
            </div>
          </div>

          <!-- Recent Tasks -->
          <div class="dashboard-card">
            <div class="card-header">
              <h2 class="card-title">Recent Tasks</h2>
              <a routerLink="/tasks" class="card-action">View all</a>
            </div>
            <div class="card-content">
              @if (recentTasks.length > 0) {
                <div class="task-list">
                  @for (task of recentTasks; track task._id) {
                    <div class="task-item" [routerLink]="['/tasks', task._id]">
                      <div class="task-status" [class]="'status-' + task.status">
                        <span class="material-icons">
                          {{ getTaskStatusIcon(task.status) }}
                        </span>
                      </div>
                      <div class="task-info">
                        <h4 class="task-title">{{ task.title }}</h4>
                        <p class="task-project">{{ task.project.name }}</p>
                      </div>
                      <div class="task-meta">
                        @if (task.priority) {
                          <span class="task-priority" [class]="'priority-' + task.priority">
                            {{ task.priority }}
                          </span>
                        }
                        @if (task.dueDate) {
                          <span class="task-due">{{ formatDate(task.dueDate) }}</span>
                        }
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="empty-state">
                  <span class="material-icons">task_alt</span>
                  <p>No tasks yet. Create your first task to get started!</p>
                  <button class="btn btn-primary" routerLink="/tasks/new">Create Task</button>
                </div>
              }
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="dashboard-card">
            <div class="card-header">
              <h2 class="card-title">Quick Actions</h2>
            </div>
            <div class="card-content">
              <div class="quick-actions">
                <a routerLink="/projects/new" class="quick-action">
                  <div class="quick-action-icon primary">
                    <span class="material-icons">add</span>
                  </div>
                  <div class="quick-action-content">
                    <h4>New Project</h4>
                    <p>Start a new project</p>
                  </div>
                </a>

                <a routerLink="/tasks/new" class="quick-action">
                  <div class="quick-action-icon warning">
                    <span class="material-icons">add_task</span>
                  </div>
                  <div class="quick-action-content">
                    <h4>New Task</h4>
                    <p>Create a task</p>
                  </div>
                </a>

                <a routerLink="/kanban" class="quick-action">
                  <div class="quick-action-icon success">
                    <span class="material-icons">view_kanban</span>
                  </div>
                  <div class="quick-action-content">
                    <h4>Kanban Board</h4>
                    <p>Manage tasks visually</p>
                  </div>
                </a>

                <a routerLink="/projects" class="quick-action">
                  <div class="quick-action-icon info">
                    <span class="material-icons">folder</span>
                  </div>
                  <div class="quick-action-content">
                    <h4>All Projects</h4>
                    <p>View all projects</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <!-- Activity Feed -->
          <div class="dashboard-card">
            <div class="card-header">
              <h2 class="card-title">Recent Activity</h2>
            </div>
            <div class="card-content">
              @if (recentActivity.length > 0) {
                <div class="activity-feed">
                  @for (activity of recentActivity; track $index) {
                    <div class="activity-item">
                      <div class="activity-icon" [class]="activity.type">
                        <span class="material-icons">{{ activity.icon }}</span>
                      </div>
                      <div class="activity-content">
                        <p [innerHTML]="activity.message"></p>
                        <span class="activity-time">{{ formatDate(activity.timestamp) }}</span>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="empty-state">
                  <span class="material-icons">timeline</span>
                  <p>No recent activity to show.</p>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard {
      padding: var(--space-4);
      max-width: 1400px;
      margin: 0 auto;
      min-height: calc(100vh - 200px);
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

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-5);
      gap: var(--space-3);
    }

    .dashboard-title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--neutral-900);
      margin-bottom: var(--space-1);
    }

    .dashboard-subtitle {
      color: var(--neutral-600);
      font-size: var(--font-size-lg);
    }

    .dashboard-actions {
      display: flex;
      gap: var(--space-2);
      flex-shrink: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: var(--space-3);
      margin-bottom: var(--space-5);
    }

    .stat-card {
      background: white;
      border-radius: var(--border-radius-lg);
      padding: var(--space-4);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--neutral-200);
      display: flex;
      align-items: center;
      gap: var(--space-3);
      transition: all var(--transition-fast);
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--border-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-primary .stat-icon {
      background-color: var(--primary-100);
      color: var(--primary-600);
    }

    .stat-warning .stat-icon {
      background-color: var(--warning-100);
      color: var(--warning-600);
    }

    .stat-success .stat-icon {
      background-color: var(--success-100);
      color: var(--success-600);
    }

    .stat-error .stat-icon {
      background-color: var(--error-100);
      color: var(--error-600);
    }

    .stat-number {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--neutral-900);
      margin-bottom: var(--space-1);
    }

    .stat-label {
      color: var(--neutral-600);
      font-size: var(--font-size-sm);
      margin: 0;
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: var(--space-4);
    }

    .dashboard-card {
      background: white;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--neutral-200);
      overflow: hidden;
    }

    .card-header {
      padding: var(--space-4) var(--space-4) var(--space-2);
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--neutral-100);
    }

    .card-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--neutral-900);
      margin: 0;
    }

    .card-action {
      color: var(--primary-600);
      text-decoration: none;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }

    .card-action:hover {
      color: var(--primary-700);
    }

    .card-content {
      padding: var(--space-3) var(--space-4) var(--space-4);
    }

    .project-list, .task-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .project-item, .task-item {
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .project-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-3);
      border-radius: var(--border-radius-md);
      border: 1px solid var(--neutral-200);
    }

    .project-item:hover {
      border-color: var(--primary-300);
      background-color: var(--primary-50);
    }

    .project-name {
      font-weight: var(--font-weight-semibold);
      color: var(--neutral-900);
      margin-bottom: var(--space-1);
    }

    .project-description {
      color: var(--neutral-600);
      font-size: var(--font-size-sm);
      margin-bottom: var(--space-2);
    }

    .project-meta {
      display: flex;
      gap: var(--space-3);
      font-size: var(--font-size-xs);
      color: var(--neutral-500);
    }

    .project-members, .project-created {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }

    .project-members .material-icons,
    .project-created .material-icons {
      font-size: 14px;
    }

    .progress-circle {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .progress-ring {
      transform: rotate(-90deg);
    }

    .progress-ring-circle {
      transition: stroke-dashoffset 0.35s;
    }

    .progress-text {
      position: absolute;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--primary-600);
    }

    .task-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-2);
      border-radius: var(--border-radius-md);
    }

    .task-item:hover {
      background-color: var(--neutral-50);
    }

    .task-status {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
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

    .task-status .material-icons {
      font-size: 16px;
    }

    .task-info {
      flex: 1;
    }

    .task-title {
      font-weight: var(--font-weight-medium);
      color: var(--neutral-900);
      margin-bottom: var(--space-1);
    }

    .task-project {
      color: var(--neutral-600);
      font-size: var(--font-size-sm);
      margin: 0;
    }

    .task-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--space-1);
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

    .task-due {
      font-size: var(--font-size-xs);
      color: var(--neutral-500);
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: var(--space-3);
    }

    .quick-action {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3);
      border-radius: var(--border-radius-md);
      border: 1px solid var(--neutral-200);
      text-decoration: none;
      transition: all var(--transition-fast);
    }

    .quick-action:hover {
      border-color: var(--primary-300);
      background-color: var(--primary-50);
      transform: translateY(-1px);
    }

    .quick-action-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--border-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .quick-action-icon.primary {
      background-color: var(--primary-100);
      color: var(--primary-600);
    }

    .quick-action-icon.warning {
      background-color: var(--warning-100);
      color: var(--warning-600);
    }

    .quick-action-icon.success {
      background-color: var(--success-100);
      color: var(--success-600);
    }

    .quick-action-icon.info {
      background-color: var(--info-100);
      color: var(--info-600);
    }

    .quick-action-content h4 {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--neutral-900);
      margin-bottom: var(--space-1);
    }

    .quick-action-content p {
      font-size: var(--font-size-xs);
      color: var(--neutral-600);
      margin: 0;
    }

    .activity-feed {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .activity-item {
      display: flex;
      gap: var(--space-3);
      align-items: flex-start;
    }

    .activity-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .activity-icon.primary {
      background-color: var(--primary-100);
      color: var(--primary-600);
    }

    .activity-icon.success {
      background-color: var(--success-100);
      color: var(--success-600);
    }

    .activity-icon.warning {
      background-color: var(--warning-100);
      color: var(--warning-600);
    }

    .activity-icon.info {
      background-color: var(--info-100);
      color: var(--info-600);
    }

    .activity-icon .material-icons {
      font-size: 16px;
    }

    .activity-content p {
      color: var(--neutral-900);
      font-size: var(--font-size-sm);
      margin-bottom: var(--space-1);
    }

    .activity-time {
      font-size: var(--font-size-xs);
      color: var(--neutral-500);
    }

    .empty-state {
      text-align: center;
      padding: var(--space-5) var(--space-3);
      color: var(--neutral-600);
    }

    .empty-state .material-icons {
      font-size: 48px;
      color: var(--neutral-400);
      margin-bottom: var(--space-2);
    }

    .empty-state p {
      margin-bottom: var(--space-3);
    }

    @media (max-width: 768px) {
      .dashboard {
        padding: var(--space-3);
      }

      .dashboard-header {
        flex-direction: column;
        align-items: stretch;
        gap: var(--space-3);
      }

      .dashboard-actions {
        justify-content: stretch;
      }

      .dashboard-actions .btn {
        flex: 1;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: var(--space-2);
      }

      .content-grid {
        grid-template-columns: 1fr;
        gap: var(--space-3);
      }

      .project-item {
        flex-direction: column;
        align-items: stretch;
        gap: var(--space-2);
      }

      .quick-actions {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  http = inject(HttpClient);
  
  userName = '';
  isLoading = true;
  
  stats: DashboardStats = {
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    overdueTasks: 0
  };

  recentProjects: Project[] = [];
  recentTasks: Task[] = [];
  recentActivity: any[] = [];

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.userName = user.firstName;
        this.loadDashboardData();
      }
    });
  }

  private async loadDashboardData() {
    try {
      this.isLoading = true;
      
      // Cargar datos en paralelo
      await Promise.all([
        this.loadStats(),
        this.loadRecentProjects(),
        this.loadRecentTasks()
      ]);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadStats() {
    try {
      // Cargar estadísticas desde tu API
      const statsResponse = await this.http.get<DashboardStats>(
        `${environment.apiUrl}/dashboard/stats`
      ).toPromise();
      
      if (statsResponse) {
        this.stats = statsResponse;
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  private async loadRecentProjects() {
    try {
      // Cargar proyectos recientes desde tu API
      const projectsResponse = await this.http.get<Project[]>(
        `${environment.apiUrl}/projects?limit=3&sort=-createdAt`
      ).toPromise();
      
      if (projectsResponse) {
        this.recentProjects = projectsResponse.map(project => ({
          ...project,
          progress: this.calculateProjectProgress(project)
        }));
      }
    } catch (error) {
      console.error('Error loading recent projects:', error);
    }
  }

  private async loadRecentTasks() {
    try {
      // Cargar tareas recientes desde tu API
      const tasksResponse = await this.http.get<Task[]>(
        `${environment.apiUrl}/tasks?limit=4&sort=-createdAt&populate=project`
      ).toPromise();
      
      if (tasksResponse) {
        this.recentTasks = tasksResponse;
      }
    } catch (error) {
      console.error('Error loading recent tasks:', error);
    }
  }

  private calculateProjectProgress(project: Project): number {
    // Lógica temporal - deberías calcular esto basado en las tareas completadas
    if (project.taskCount && project.completedTaskCount) {
      return Math.round((project.completedTaskCount / project.taskCount) * 100);
    }
    return 0;
  }

  private assignRandomPriority(): 'low' | 'medium' | 'high' {
    // Función temporal - deberías agregar priority a tu schema de Task
    const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    return priorities[Math.floor(Math.random() * priorities.length)];
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
getTaskStatusIcon(status: 'pending' | 'in_progress' | 'completed'): string {
    switch(status) {
      case 'pending': return 'schedule';
      case 'in_progress': return 'autorenew';
      case 'completed': return 'check_circle';
      default: return 'help_outline';
    }
  }
}