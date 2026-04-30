import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
    {
        path: 'auth/login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'contracts',
        canActivate: [authGuard], // Redirects to login if not authenticated
        children: [
            {
                path: '',
                loadComponent: () => import('./features/contracts/contract-list/contract-list.component').then(m => m.ContractListComponent)
            },
            {
                path: 'create',
                // BU and Admin can create; Viewers cannot
                loadComponent: () => import('./features/contracts/contract-form/contract-form.component').then(m => m.ContractFormComponent)
            },
            {
                path: ':id',
                loadComponent: () => import('./features/contracts/contract-detail/contract-detail.component').then(m => m.ContractDetailComponent)
            }
        ]
    },
    { path: '**', redirectTo: 'contracts' } // Catch-all redirect
];