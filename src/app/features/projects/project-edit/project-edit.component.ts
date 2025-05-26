import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Project {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
  status?: 'active' | 'completed' | 'on-hold' | 'cancelled';
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
}

@Component({
  selector: 'app-edit-project',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="edit-project">
      <!-- Header -->
      <div class="page-header">
        <div class="header-navigation">
          <button class="btn btn-ghost" (click)="goBack()">
            <span class="material-icons">arrow_back</span>
            Back
          </button>
          <div class="breadcrumb">
            <a routerLink="/projects" class="breadcrumb-link">Projects</a>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-current">{{ project?.name || 'Edit Project' }}</span>
          </div>
        </div>
        <div class="header-actions">
          @if (project) {
            <button class="btn btn-outline" (click)="deleteProject()" [disabled]="isDeleting">
              <span class="material-icons">delete</span>
              Delete Project
            </button>
          }
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading project...</p>
        </div>
      } @else if (project) {
        <!-- Edit Form -->
        <div class="form-container">
          <div class="form-card">
            <div class="form-header">
              <h1 class="form-title">Edit Project</h1>
              <p class="form-subtitle">Update your project details and settings</p>
            </div>

            <form [formGroup]="projectForm" (ngSubmit)="onSubmit()" class="project-form">
              <!-- Basic Information -->
              <div class="form-section">
                <h3 class="section-title">Basic Information</h3>
                
                <div class="form-group">
                  <label for="name" class="form-label">Project Name *</label>
                  <input
                    type="text"
                    id="name"
                    formControlName="name"
                    class="form-input"
                    placeholder="Enter project name"
                    [class.error]="projectForm.get('name')?.invalid && projectForm.get('name')?.touched">
                  @if (projectForm.get('name')?.invalid && projectForm.get('name')?.touched) {
                    <span class="form-error">Project name is required</span>
                  }
                </div>

                <div class="form-group">
                  <label for="description" class="form-label">Description</label>
                  <textarea
                    id="description"
                    formControlName="description"
                    class="form-textarea"
                    placeholder="Describe your project..."
                    rows="4"></textarea>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="status" class="form-label">Status</label>
                    <select id="status" formControlName="status" class="form-select">
                      <option value="active">Active</option>
                      <option value="on-hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="priority" class="form-label">Priority</label>
                    <select id="priority" formControlName="priority" class="form-select">
                      <option value="">Select priority</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label for="dueDate" class="form-label">Due Date</label>
                  <input
                    type="date"
                    id="dueDate"
                    formControlName="dueDate"
                    class="form-input">
                </div>
              </div>

              <!-- Team Members -->
              <div class="form-section">
                <h3 class="section-title">Team Members</h3>
                
                <div class="members-section">
                  <!-- Add Member Search -->
                  <div class="add-member-container">
                    <label class="form-label">Add Team Member</label>
                    <div class="search-wrapper" [class.active]="showSearchResults">
                      <div class="search-input-wrapper">
                        <span class="material-icons search-icon">search</span>
                        <input
                          type="text"
                          [(ngModel)]="memberSearchTerm"
                          (input)="onSearchInput()"
                          (focus)="onSearchFocus()"
                          (blur)="onSearchBlur()"
                          placeholder="Search members by name or email..."
                          class="search-input"
                          [ngModelOptions]="{standalone: true}">
                        @if (memberSearchTerm.length > 0) {
                          <button type="button" class="clear-search-btn" (click)="clearSearch()">
                            <span class="material-icons">close</span>
                          </button>
                        }
                      </div>

                      <!-- Search Results Dropdown -->
                      @if (showSearchResults && searchResults.length > 0) {
                        <div class="search-dropdown">
                          <div class="search-results-header">
                            <span class="results-count">{{ searchResults.length }} result{{ searchResults.length !== 1 ? 's' : '' }}</span>
                          </div>
                          <div class="search-results-list">
                            @for (user of searchResults; track user._id) {
                              <div class="search-result-item" (click)="addMember(user)">
                                <div class="user-avatar">{{ getUserInitials(user) }}</div>
                                <div class="user-details">
                                  <div class="user-name">{{ user.firstName }} {{ user.lastName }}</div>
                                  <div class="user-email">{{ user.email }}</div>
                                </div>
                                <div class="add-button">
                                  <span class="material-icons">person_add</span>
                                </div>
                              </div>
                            }
                          </div>
                        </div>
                      }

                      @if (showSearchResults && memberSearchTerm.length >= 2 && searchResults.length === 0) {
                        <div class="search-dropdown">
                          <div class="no-results">
                            <span class="material-icons">person_search</span>
                            <p>No members found</p>
                            <small>Try searching with a different term</small>
                          </div>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Current Members List -->
                  @if (selectedMembers.length > 0) {
                    <div class="current-members">
                      <div class="members-header">
                        <h4 class="members-title">
                          <span class="material-icons">group</span>
                          Project Members
                          <span class="members-count">({{ selectedMembers.length }})</span>
                        </h4>
                      </div>
                      
                      <div class="members-grid">
                        @for (member of selectedMembers; track member._id) {
                          <div class="member-card" [class.owner]="member._id === project?.owner">
                            <div class="member-avatar">{{ getUserInitials(member) }}</div>
                            <div class="member-info">
                              <div class="member-name">{{ member.firstName }} {{ member.lastName }}</div>
                              <div class="member-email">{{ member.email }}</div>
                              @if (member._id === project?.owner) {
                                <div class="member-role owner-role">
                                  <span class="material-icons">star</span>
                                  Project Owner
                                </div>
                              } @else {
                                <div class="member-role">Team Member</div>
                              }
                            </div>
                            @if (member._id !== project?.owner) {
                              <button 
                                type="button" 
                                class="remove-member-btn" 
                                (click)="removeMember(member._id)"
                                title="Remove member">
                                <span class="material-icons">close</span>
                              </button>
                            }
                          </div>
                        }
                      </div>
                    </div>
                  } @else {
                    <div class="empty-members">
                      <span class="material-icons">group_add</span>
                      <p>No team members added yet</p>
                      <small>Search and add members to collaborate on this project</small>
                    </div>
                  }
                </div>
              </div>

              <!-- Form Actions -->
              <div class="form-actions">
                <button type="button" class="btn btn-outline" (click)="goBack()">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="projectForm.invalid || isSaving">
                  @if (isSaving) {
                    <span class="loading-spinner small"></span>
                  }
                  {{ isSaving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      } @else {
        <!-- Error State -->
        <div class="error-container">
          <div class="error-content">
            <span class="material-icons error-icon">error_outline</span>
            <h2>Project Not Found</h2>
            <p>The project you're looking for doesn't exist or has been deleted.</p>
            <button class="btn btn-primary" routerLink="/projects">
              Go to Projects
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .edit-project {
      padding: var(--space-4);
      max-width: 1200px;
      margin: 0 auto;
      min-height: calc(100vh - 200px);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-5);
      gap: var(--space-3);
    }

    .header-navigation {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      font-size: var(--font-size-sm);
    }

    .breadcrumb-link {
      color: var(--primary-600);
      text-decoration: none;
    }

    .breadcrumb-link:hover {
      color: var(--primary-700);
    }

    .breadcrumb-separator {
      color: var(--neutral-400);
    }

    .breadcrumb-current {
      color: var(--neutral-600);
      font-weight: var(--font-weight-medium);
    }

    .header-actions {
      display: flex;
      gap: var(--space-2);
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

    .loading-spinner.small {
      width: 16px;
      height: 16px;
      border-width: 2px;
      margin-bottom: 0;
      margin-right: var(--space-1);
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .form-container {
      display: flex;
      justify-content: center;
    }

    .form-card {
      background: white;
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--neutral-200);
      width: 100%;
      max-width: 800px;
      overflow: hidden;
    }

    .form-header {
      padding: var(--space-5);
      border-bottom: 1px solid var(--neutral-200);
      text-align: center;
    }

    .form-title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--neutral-900);
      margin-bottom: var(--space-1);
    }

    .form-subtitle {
      color: var(--neutral-600);
      font-size: var(--font-size-md);
      margin: 0;
    }

    .project-form {
      padding: var(--space-5);
    }

    .form-section {
      margin-bottom: var(--space-5);
    }

    .section-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--neutral-900);
      margin-bottom: var(--space-3);
      padding-bottom: var(--space-2);
      border-bottom: 1px solid var(--neutral-200);
    }

    .form-group {
      margin-bottom: var(--space-3);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-3);
    }

    .form-label {
      display: block;
      font-weight: var(--font-weight-medium);
      color: var(--neutral-700);
      margin-bottom: var(--space-1);
      font-size: var(--font-size-sm);
    }

    .form-input,
    .form-textarea,
    .form-select {
      width: 100%;
      padding: var(--space-2);
      border: 1px solid var(--neutral-300);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-md);
      transition: all var(--transition-fast);
    }

    .form-input:focus,
    .form-textarea:focus,
    .form-select:focus {
      outline: none;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px var(--primary-100);
    }

    .form-input.error {
      border-color: var(--error-500);
    }

    .form-error {
      color: var(--error-600);
      font-size: var(--font-size-xs);
      margin-top: var(--space-1);
      display: block;
    }

    /* Improved Members Section */
    .members-section {
      background: var(--neutral-50);
      border-radius: var(--border-radius-lg);
      padding: var(--space-4);
      border: 1px solid var(--neutral-200);
    }

    .add-member-container {
      margin-bottom: var(--space-4);
    }

    .search-wrapper {
      position: relative;
    }

    .search-wrapper.active .search-input-wrapper {
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px var(--primary-100);
    }

    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      background: white;
      border: 2px solid var(--neutral-300);
      border-radius: var(--border-radius-lg);
      transition: all var(--transition-fast);
    }

    .search-icon {
      position: absolute;
      left: var(--space-3);
      color: var(--neutral-500);
      font-size: 20px;
    }

    .search-input {
      flex: 1;
      padding: var(--space-3) var(--space-5);
      padding-left: calc(var(--space-5) + 24px);
      border: none;
      background: transparent;
      font-size: var(--font-size-md);
      outline: none;
    }

    .search-input::placeholder {
      color: var(--neutral-500);
    }

    .clear-search-btn {
      position: absolute;
      right: var(--space-2);
      background: none;
      border: none;
      color: var(--neutral-500);
      cursor: pointer;
      padding: var(--space-1);
      border-radius: var(--border-radius-sm);
      transition: all var(--transition-fast);
    }

    .clear-search-btn:hover {
      background-color: var(--neutral-100);
      color: var(--neutral-700);
    }

    .search-dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: white;
      border: 1px solid var(--neutral-200);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-lg);
      z-index: 20;
      overflow: hidden;
    }

    .search-results-header {
      padding: var(--space-2) var(--space-3);
      background: var(--neutral-50);
      border-bottom: 1px solid var(--neutral-200);
    }

    .results-count {
      font-size: var(--font-size-xs);
      color: var(--neutral-600);
      font-weight: var(--font-weight-medium);
      text-transform: uppercase;
    }

    .search-results-list {
      max-height: 280px;
      overflow-y: auto;
    }

    .search-result-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3);
      cursor: pointer;
      transition: all var(--transition-fast);
      border-bottom: 1px solid var(--neutral-100);
    }

    .search-result-item:last-child {
      border-bottom: none;
    }

    .search-result-item:hover {
      background-color: var(--primary-50);
    }

    .search-result-item .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-sm);
      flex-shrink: 0;
    }

    .user-details {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-weight: var(--font-weight-semibold);
      color: var(--neutral-900);
      margin-bottom: 2px;
      font-size: var(--font-size-sm);
    }

    .user-email {
      color: var(--neutral-600);
      font-size: var(--font-size-xs);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .add-button {
      color: var(--primary-600);
      transition: transform var(--transition-fast);
    }

    .search-result-item:hover .add-button {
      transform: scale(1.1);
    }

    .no-results {
      padding: var(--space-5);
      text-align: center;
      color: var(--neutral-500);
    }

    .no-results .material-icons {
      font-size: 48px;
      margin-bottom: var(--space-2);
      opacity: 0.7;
    }

    .no-results p {
      margin: 0 0 var(--space-1);
      font-weight: var(--font-weight-medium);
    }

    .no-results small {
      font-size: var(--font-size-xs);
    }

    /* Current Members */
    .current-members {
      border-top: 1px solid var(--neutral-200);
      padding-top: var(--space-4);
    }

    .members-header {
      margin-bottom: var(--space-3);
    }

    .members-title {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--neutral-900);
      margin: 0;
    }

    .members-count {
      background: var(--primary-100);
      color: var(--primary-700);
      padding: 2px 8px;
      border-radius: var(--border-radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
    }

    .members-grid {
      display: grid;
      gap: var(--space-3);
    }

    .member-card {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3);
      background: white;
      border: 1px solid var(--neutral-200);
      border-radius: var(--border-radius-lg);
      transition: all var(--transition-fast);
      position: relative;
    }

    .member-card:hover {
      box-shadow: var(--shadow-sm);
      transform: translateY(-1px);
    }

    .member-card.owner {
      border-color: var(--warning-300);
      background: linear-gradient(to right, white, var(--warning-50));
    }

    .member-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-md);
      flex-shrink: 0;
    }

    .member-card.owner .member-avatar {
      background: linear-gradient(135deg, var(--warning-500), var(--warning-600));
    }

    .member-info {
      flex: 1;
      min-width: 0;
    }

    .member-name {
      font-weight: var(--font-weight-semibold);
      color: var(--neutral-900);
      margin-bottom: 2px;
      font-size: var(--font-size-sm);
    }

    .member-email {
      color: var(--neutral-600);
      font-size: var(--font-size-xs);
      margin-bottom: var(--space-1);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .member-role {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: var(--font-size-xs);
      color: var(--neutral-600);
      background: var(--neutral-100);
      padding: 2px 8px;
      border-radius: var(--border-radius-sm);
      font-weight: var(--font-weight-medium);
    }

    .owner-role {
      background: var(--warning-100);
      color: var(--warning-700);
    }

    .owner-role .material-icons {
      font-size: 14px;
    }

    .remove-member-btn {
      position: absolute;
      top: var(--space-2);
      right: var(--space-2);
      background: none;
      border: none;
      color: var(--neutral-400);
      cursor: pointer;
      padding: 4px;
      border-radius: var(--border-radius-sm);
      transition: all var(--transition-fast);
      opacity: 0;
    }

    .member-card:hover .remove-member-btn {
      opacity: 1;
    }

    .remove-member-btn:hover {
      background-color: var(--error-100);
      color: var(--error-600);
    }

    .empty-members {
      text-align: center;
      padding: var(--space-6);
      color: var(--neutral-500);
    }

    .empty-members .material-icons {
      font-size: 48px;
      margin-bottom: var(--space-2);
      opacity: 0.7;
    }

    .empty-members p {
      margin: 0 0 var(--space-1);
      font-weight: var(--font-weight-medium);
    }

    .empty-members small {
      font-size: var(--font-size-xs);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-2);
      padding-top: var(--space-4);
      border-top: 1px solid var(--neutral-200);
    }

    .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .error-content {
      text-align: center;
      color: var(--neutral-600);
    }

    .error-icon {
      font-size: 64px;
      color: var(--error-500);
      margin-bottom: var(--space-3);
    }

    .error-content h2 {
      color: var(--neutral-900);
      margin-bottom: var(--space-2);
    }

    .error-content p {
      margin-bottom: var(--space-4);
    }

    @media (max-width: 768px) {
      .edit-project {
        padding: var(--space-3);
      }

      .page-header {
        flex-direction: column;
        align-items: stretch;
        gap: var(--space-3);
      }

      .header-navigation {
        justify-content: space-between;
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

      .members-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EditProjectComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  projectForm: FormGroup;
  project: Project | null = null;
  projectId: string | null = null;
  
  isLoading = true;
  isSaving = false;
  isDeleting = false;
  
  memberSearchTerm = '';
  searchResults: User[] = [];
  selectedMembers: User[] = [];
  allUsers: User[] = [];
  showSearchResults = false;
  private searchTimeout: any;

  constructor() {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      status: ['active'],
      priority: [''],
      dueDate: ['']
    });
  }

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id');
    if (this.projectId) {
      this.loadProject();
      this.loadAllUsers();
    }
  }

  private async loadProject() {
    try {
      this.isLoading = true;
      const response = await this.http.get<Project>(
        `${environment.apiUrl}/projects/${this.projectId}`
      ).toPromise();
      
      if (response) {
        this.project = response;
        this.updateForm();
        await this.loadProjectMembers();
      }
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadAllUsers() {
    try {
      const response = await this.http.get<User[]>(
        `${environment.apiUrl}/users`
      ).toPromise();
      
      if (response) {
        this.allUsers = response;
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  private async loadProjectMembers() {
  if (!this.project) return;

  if (
    this.project.members.length > 0 &&
    typeof this.project.members[0] === 'object' &&
    this.project.members[0] !== null
  ) {
    // Ya son objetos User
    this.selectedMembers = this.project.members as unknown as User[];
  } else {
    // Son IDs, cargarlos
    try {
      const memberPromises = this.project.members.map(memberId =>
        this.http.get<User>(`${environment.apiUrl}/users/${memberId}`).toPromise()
      );
      const members = await Promise.all(memberPromises);
      this.selectedMembers = members.filter(Boolean) as User[];
    } catch (error) {
      console.error('Error loading project members:', error);
    }
  }
}


  private updateForm() {
    if (!this.project) return;
    
    this.projectForm.patchValue({
      name: this.project.name,
      description: this.project.description || '',
      status: this.project.status || 'active',
      priority: this.project.priority || '',
      dueDate: this.project.dueDate ? this.formatDateForInput(this.project.dueDate) : ''
    });
  }

  private formatDateForInput(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  }

  onSearchInput() {
    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Debounce search
    this.searchTimeout = setTimeout(() => {
      this.performSearch();
    }, 300);
  }

  onSearchFocus() {
    if (this.memberSearchTerm.length >= 2) {
      this.showSearchResults = true;
      this.performSearch();
    }
  }

  onSearchBlur() {
    // Delay hiding to allow click on results
    setTimeout(() => {
      this.showSearchResults = false;
    }, 200);
  }

  private performSearch() {
    if (this.memberSearchTerm.length < 2) {
      this.searchResults = [];
      this.showSearchResults = false;
      return;
    }

    const searchTerm = this.memberSearchTerm.toLowerCase();
    this.searchResults = this.allUsers
      .filter(user => 
        (user.firstName.toLowerCase().includes(searchTerm) ||
         user.lastName.toLowerCase().includes(searchTerm) ||
         user.email.toLowerCase().includes(searchTerm)) &&
        !this.selectedMembers.some(member => member._id === user._id)
      )
      .slice(0, 8); // Show more results

    this.showSearchResults = true;
  }

  clearSearch() {
    this.memberSearchTerm = '';
    this.searchResults = [];
    this.showSearchResults = false;
  }

  addMember(user: User) {
    if (!this.selectedMembers.some(member => member._id === user._id)) {
      this.selectedMembers.push(user);
      this.clearSearch();
      
      // Update search results to remove added user
      this.searchResults = this.searchResults.filter(result => result._id !== user._id);
    }
  }

  removeMember(userId: string) {
    this.selectedMembers = this.selectedMembers.filter(member => member._id !== userId);
    
    // If search is active, refresh results to show the removed user again
    if (this.memberSearchTerm.length >= 2) {
      this.performSearch();
    }
  }

  getUserInitials(user: User): string {
    return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
  }

  async onSubmit() {
    if (this.projectForm.invalid || !this.project) return;

    try {
      this.isSaving = true;
      
      const formData = this.projectForm.value;
      const updateData = {
        ...formData,
        members: this.selectedMembers.map(member => member._id),
        dueDate: formData.dueDate || null
      };

      await this.http.put(
        `${environment.apiUrl}/projects/${this.projectId}`,
        updateData
      ).toPromise();

      this.router.navigate(['/projects']);
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      this.isSaving = false;
    }
  }

  async deleteProject() {
    if (!this.project || !confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      this.isDeleting = true;
      
      await this.http.delete(
        `${environment.apiUrl}/projects/${this.projectId}`
      ).toPromise();

      this.router.navigate(['/projects']);
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      this.isDeleting = false;
    }
  }

  goBack() {
    this.router.navigate(['/projects']);
  }
}