import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
    {
        path: 'auth',
        loadComponent: () => import('./core/layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
        children: [
            { path: '', redirectTo: 'login', pathMatch: 'full' },
            {
                path: 'login',
                canActivate: [guestGuard],
                loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
            }
        ]
    },
    {
        path: '',
        loadComponent: () => import('./core/layouts/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
        canActivate: [authGuard],
        children: [
            {
                path: '',
                redirectTo: 'contracts',
                pathMatch: 'full'
            },
            {
                path: 'contracts',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./features/contracts/contract-list/contract-list.component').then(m => m.ContractListComponent)
                    },
                    {
                        path: 'create',
                        canActivate: [roleGuard(['admin', 'bu'])],
                        loadComponent: () => import('./features/contracts/contract-form/contract-form.component').then(m => m.ContractFormComponent)
                    },
                    {
                        path: ':id',
                        loadComponent: () => import('./features/contracts/contract-detail/contract-detail.component').then(m => m.ContractDetailComponent)
                    }
                ]
            }
        ]
    },
    { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
    { path: '**', redirectTo: 'contracts' }
];
