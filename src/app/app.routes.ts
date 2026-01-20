import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./features/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'dashboard',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'perfil',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./features/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'fornos',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./features/fornos/fornos.component').then((m) => m.FornosComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
