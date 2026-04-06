import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'employees' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/signup/signup.component').then((m) => m.SignupComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'employees',
    loadComponent: () =>
      import('./features/employees/employee-list/employee-list.component').then((m) => m.EmployeeListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'add-employee',
    loadComponent: () =>
      import('./features/employees/employee-form/employee-form.component').then((m) => m.EmployeeFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'view-employee/:id',
    loadComponent: () =>
      import('./features/employees/employee-view/employee-view.component').then((m) => m.EmployeeViewComponent),
    canActivate: [authGuard],
  },
  {
    path: 'update-employee/:id',
    loadComponent: () =>
      import('./features/employees/employee-form/employee-form.component').then((m) => m.EmployeeFormComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'employees' },
];
