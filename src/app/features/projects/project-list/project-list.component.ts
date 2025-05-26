import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

interface Project {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
  status?: 'planning' | 'active' | 'on-hold' | 'completed';
  taskCount?: number;
  completedTaskCount?: number;
  progress?: number;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
}

interface ProjectMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="projects-page">
      <!-- Header Section -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title">Projects</h1>
            <p class="page-subtitle">Manage and track all your projects in one place</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-outline" (click)="toggleFilters()">
              <span class="material-icons">filter_list</span>
              Filters
            </button>
            <button class="btn btn-primary" routerLink="/projects/new">
              <span class="material-icons">add</span>
              New Project
            </button>
          </div>
        </div>

        <!-- Filter Bar -->
        @if (showFilters) {
          <div class="filter-bar">
            <div class="filters">
              <div class="filter-group">
                <label>Status</label>
                <select [(ngModel)]="selectedStatus" (ngModelChange)="applyFilters()" class="filter-select">
                  <option value="">All Status</option>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Priority</label>
                <select [(ngModel)]="selectedPriority" (ngModelChange)="applyFilters()" class="filter-select">
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div class="filter-group">
                <label>Search</label>
                <div class="search-input">
                  <span class="material-icons">search</span>
                  <input 
                    type="text" 
                    placeholder="Search projects..." 
                    [(ngModel)]="searchTerm"
                    (ngModelChange)="applyFilters()"
                  >
                </div>
              </div>

              <div class="filter-group">
                <label>View</label>
                <div class="view-toggle">
                  <button 
                    class="view-btn" 
                    [class.active]="viewMode === 'grid'"
                    (click)="setViewMode('grid')"
                  >
                    <span class="material-icons">grid_view</span>
                  </button>
                  <button 
                    class="view-btn" 
                    [class.active]="viewMode === 'list'"
                    (click)="setViewMode('list')"
                  >
                    <span class="material-icons">view_list</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Loading State -->
      @if (isLoading) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading projects...</p>
        </div>
      } @else {
        <!-- Projects Count -->
        <div class="projects-count">
          <p>{{ filteredProjects.length }} of {{ projects.length }} projects</p>
        </div>

        <!-- Projects Grid/List -->
        @if (filteredProjects.length > 0) {
          <div class="projects-container" [class]="'view-' + viewMode">
            @for (project of filteredProjects; track project._id) {
              <div class="project-card" [routerLink]="['/projects', project._id]">
                <!-- Project Header -->
                <div class="project-header">
                  <div class="project-title-section">
                    <h3 class="project-name">{{ project.name }}</h3>
                    <div class="project-badges">
                      @if (project.status) {
                        <span class="badge" [class]="'badge-' + project.status">
                          {{ getStatusLabel(project.status) }}
                        </span>
                      }
                      @if (project.priority) {
                        <span class="priority-badge" [class]="'priority-' + project.priority">
                          {{ project.priority }}
                        </span>
                      }
                    </div>
                  </div>
                  
                  <div class="project-actions">
                    <button class="action-btn" (click)="editProject(project, $event)">
                      <span class="material-icons">edit</span>
                    </button>
                    <button class="action-btn" (click)="deleteProject(project, $event)">
                      <span class="material-icons">delete</span>
                    </button>
                  </div>
                </div>

                <!-- Project Description -->
                @if (project.description) {
                  <p class="project-description">{{ project.description }}</p>
                }

                <!-- Project Progress -->
                <div class="project-progress">
                  <div class="progress-header">
                    <span class="progress-label">Progress</span>
                    <span class="progress-percentage">{{ project.progress || 0 }}%</span>
                  </div>
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      [style.width.%]="project.progress || 0"
                    ></div>
                  </div>
                  <div class="progress-details">
                    <span class="task-count">
                      {{ project.completedTaskCount || 0 }}/{{ project.taskCount || 0 }} tasks completed
                    </span>
                  </div>
                </div>

                <!-- Project Footer -->
                <div class="project-footer">
                  <div class="project-members">
                    <span class="members-label">
                      <span class="material-icons">group</span>
                      {{ project.members.length }} member{{ project.members.length === 1 ? '' : 's' }}
                    </span>
                  </div>
                  
                  <div class="project-dates">
                    @if (project.dueDate) {
                      <span class="due-date" [class.overdue]="isOverdue(project.dueDate)">
                        <span class="material-icons">schedule</span>
                        Due {{ formatDate(project.dueDate) }}
                      </span>
                    }
                    <span class="created-date">
                      Created {{ formatDate(project.createdAt) }}
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <!-- Empty State -->
          <div class="empty-state">
            @if (searchTerm || selectedStatus || selectedPriority) {
              <span class="material-icons">search_off</span>
              <h3>No projects found</h3>
              <p>Try adjusting your filters or search terms</p>
              <button class="btn btn-outline" (click)="clearFilters()">Clear Filters</button>
            } @else {
              <span class="material-icons">folder_open</span>
              <h3>No projects yet</h3>
              <p>Create your first project to start organizing your work</p>
              <button class="btn btn-primary" routerLink="/projects/new">Create Project</button>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .projects-page {
      padding: var(--space-4);
      max-width: 1400px;
      margin: 0 auto;
      min-height: calc(100vh - 200px);
    }

    .page-header {
      margin-bottom: var(--space-5);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-3);
      gap: var(--space-3);
    }

    .page-title {
      font-size: var(--font-size-3xl);
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

    .filter-bar {
      background: white;
      border-radius: var(--border-radius-lg);
      padding: var(--space-3);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--neutral-200);
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .filters {
      display: flex;
      gap: var(--space-4);
      align-items: end;
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .filter-group label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--neutral-700);
    }

    .filter-select {
      padding: var(--space-1) var(--space-2);
      border: 1px solid var(--neutral-300);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-sm);
      min-width: 120px;
    }

    .search-input {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-input .material-icons {
      position: absolute;
      left: var(--space-2);
      color: var(--neutral-500);
      font-size: 18px;
    }

    .search-input input {
      padding: var(--space-1) var(--space-2) var(--space-1) var(--space-4);
      border: 1px solid var(--neutral-300);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-sm);
      min-width: 200px;
    }

    .view-toggle {
      display: flex;
      border: 1px solid var(--neutral-300);
      border-radius: var(--border-radius-md);
      overflow: hidden;
    }

    .view-btn {
      padding: var(--space-1) var(--space-2);
      border: none;
      background: white;
      color: var(--neutral-600);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .view-btn.active {
      background: var(--primary-100);
      color: var(--primary-600);
    }

    .view-btn:hover:not(.active) {
      background: var(--neutral-100);
    }

    .projects-count {
      margin-bottom: var(--space-3);
    }

    .projects-count p {
      color: var(--neutral-600);
      font-size: var(--font-size-sm);
      margin: 0;
    }

    .projects-container.view-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: var(--space-4);
    }

    .projects-container.view-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .project-card {
      background: white;
      border-radius: var(--border-radius-lg);
      padding: var(--space-4);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--neutral-200);
      cursor: pointer;
      transition: all var(--transition-fast);
      text-decoration: none;
      color: inherit;
    }

    .project-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: var(--primary-300);
    }

    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-3);
    }

    .project-name {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--neutral-900);
      margin-bottom: var(--space-1);
    }

    .project-badges {
      display: flex;
      gap: var(--space-1);
    }

    .badge {
      padding: 2px 8px;
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      text-transform: uppercase;
    }

    .badge-planning {
      background-color: var(--info-100);
      color: var(--info-700);
    }

    .badge-active {
      background-color: var(--success-100);
      color: var(--success-700);
    }

    .badge-on-hold {
      background-color: var(--warning-100);
      color: var(--warning-700);
    }

    .badge-completed {
      background-color: var(--neutral-100);
      color: var(--neutral-700);
    }

    .priority-badge {
      padding: 2px 8px;
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      text-transform: uppercase;
    }

    .priority-high {
      background-color: var(--error-100);
      color: var(--error-700);
    }

    .priority-medium {
      background-color: var(--warning-100);
      color: var(--warning-700);
    }

    .priority-low {
      background-color: var(--success-100);
      color: var(--success-700);
    }

    .project-actions {
      display: flex;
      gap: var(--space-1);
    }

    .action-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: none;
      color: var(--neutral-500);
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }

    .action-btn:hover {
      background: var(--neutral-100);
      color: var(--neutral-700);
    }

    .project-description {
      color: var(--neutral-600);
      margin-bottom: var(--space-3);
      line-height: 1.5;
    }

    .project-progress {
      margin-bottom: var(--space-3);
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-1);
    }

    .progress-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--neutral-700);
    }

    .progress-percentage {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--primary-600);
    }

    .progress-bar {
      height: 6px;
      background-color: var(--neutral-200);
      border-radius: var(--border-radius-sm);
      overflow: hidden;
      margin-bottom: var(--space-1);
    }

    .progress-fill {
      height: 100%;
      background-color: var(--primary-500);
      transition: width var(--transition-normal);
    }

    .progress-details {
      font-size: var(--font-size-xs);
      color: var(--neutral-500);
    }

    .project-footer {
      display: flex;
      justify-content: space-between;
      align-items: end;
      font-size: var(--font-size-sm);
      color: var(--neutral-600);
    }

    .members-label {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }

    .members-label .material-icons {
      font-size: 16px;
    }

    .project-dates {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--space-1);
    }

    .due-date {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      font-size: var(--font-size-xs);
    }

    .due-date.overdue {
      color: var(--error-600);
    }

    .due-date .material-icons {
      font-size: 14px;
    }

    .created-date {
      font-size: var(--font-size-xs);
      color: var(--neutral-500);
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

    .empty-state {
      text-align: center;
      padding: var(--space-8) var(--space-4);
      color: var(--neutral-600);
    }

    .empty-state .material-icons {
      font-size: 64px;
      color: var(--neutral-400);
      margin-bottom: var(--space-3);
    }

    .empty-state h3 {
      color: var(--neutral-700);
      margin-bottom: var(--space-2);
    }

    .empty-state p {
      margin-bottom: var(--space-4);
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    /* List View Specific Styles */
    .view-list .project-card {
      display: flex;
      align-items: center;
      padding: var(--space-3);
    }

    .view-list .project-header {
      flex: 1;
      margin-bottom: 0;
      margin-right: var(--space-3);
    }

    .view-list .project-description {
      margin-bottom: 0;
      flex: 2;
      margin-right: var(--space-3);
    }

    .view-list .project-progress {
      flex: 1;
      margin-bottom: 0;
      margin-right: var(--space-3);
    }

    .view-list .project-footer {
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      .projects-page {
        padding: var(--space-3);
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
      }

      .header-actions {
        justify-content: stretch;
      }

      .header-actions .btn {
        flex: 1;
      }

      .filters {
        flex-direction: column;
        gap: var(--space-2);
      }

      .filter-group {
        width: 100%;
      }

      .filter-select,
      .search-input input {
        width: 100%;
        min-width: auto;
      }

      .projects-container.view-grid {
        grid-template-columns: 1fr;
      }

      .view-list .project-card {
        flex-direction: column;
        align-items: stretch;
      }

      .view-list .project-header,
      .view-list .project-description,
      .view-list .project-progress {
        margin-right: 0;
        margin-bottom: var(--space-2);
      }

      .project-footer {
        flex-direction: column;
        align-items: stretch;
        gap: var(--space-2);
      }
    }
  `]
})
export class ProjectsComponent implements OnInit {
  authService = inject(AuthService);
  http = inject(HttpClient);

  projects: Project[] = [];
  filteredProjects: Project[] = [];
  isLoading = true;

  // Filter states
  showFilters = false;
  selectedStatus = '';
  selectedPriority = '';
  searchTerm = '';
  viewMode: 'grid' | 'list' = 'grid';

  ngOnInit() {
    this.loadProjects();
  }

  private async loadProjects() {
    try {
      this.isLoading = true;
      
      const response = await this.http.get<Project[]>(
        `${environment.apiUrl}/projects`
      ).toPromise();
      
      if (response) {
        this.projects = response.map(project => ({
          ...project,
          progress: this.calculateProjectProgress(project),
          status: this.assignRandomStatus(),
          priority: this.assignRandomPriority()
        }));
        this.filteredProjects = [...this.projects];
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private calculateProjectProgress(project: Project): number {
    if (project.taskCount && project.completedTaskCount) {
      return Math.round((project.completedTaskCount / project.taskCount) * 100);
    }
    return Math.floor(Math.random() * 101); // Temporal
  }

  private assignRandomStatus(): 'planning' | 'active' | 'on-hold' | 'completed' {
    const statuses: ('planning' | 'active' | 'on-hold' | 'completed')[] = 
      ['planning', 'active', 'on-hold', 'completed'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private assignRandomPriority(): 'low' | 'medium' | 'high' {
    const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    return priorities[Math.floor(Math.random() * priorities.length)];
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  applyFilters() {
    let filtered = [...this.projects];

    if (this.selectedStatus) {
      filtered = filtered.filter(p => p.status === this.selectedStatus);
    }

    if (this.selectedPriority) {
      filtered = filtered.filter(p => p.priority === this.selectedPriority);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) ||
        (p.description?.toLowerCase().includes(term))
      );
    }

    this.filteredProjects = filtered;
  }

  clearFilters() {
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.searchTerm = '';
    this.filteredProjects = [...this.projects];
  }

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'planning': 'Planning',
      'active': 'Active',
      'on-hold': 'On Hold',
      'completed': 'Completed'
    };
    return labels[status] || status;
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

  editProject(project: Project, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    // Implementar lógica de edición
    console.log('Edit project:', project);
  }

  deleteProject(project: Project, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    // Implementar lógica de eliminación
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      console.log('Delete project:', project);
      // Aquí harías la llamada HTTP para eliminar
    }
  }
}