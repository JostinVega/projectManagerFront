import { Routes } from '@angular/router';
import { ProjectsComponent } from './project-list/project-list.component';
import { ProjectCreateComponent } from './project-create/project-create.component';
import { EditProjectComponent } from './project-edit/project-edit.component';

export const PROJECT_ROUTES: Routes = [
  {
    path: '',
    component: ProjectsComponent
  },
  {
    path: 'new',
    component: ProjectCreateComponent
  },
  {
    path: ':id',
    component: EditProjectComponent
  }
];
