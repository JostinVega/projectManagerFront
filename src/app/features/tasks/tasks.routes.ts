import { Routes } from '@angular/router';
import { TasksComponent } from './task-list/task-list.component';
import { TaskCreateComponent } from './task-create/task-create.component';
import { TaskEditComponent } from './task-edit/task-edit.component';

export const TASK_ROUTES: Routes = [
  {
    path: '',
    component: TasksComponent
  },
  {
    path: 'new',
    component: TaskCreateComponent
  },
  {
    path: ":id",
    component: TaskEditComponent
  }
];
