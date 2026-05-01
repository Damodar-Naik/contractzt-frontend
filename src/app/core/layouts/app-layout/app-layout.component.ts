import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgClass],
  template: `
    <div class="min-h-screen bg-gray-900 text-white">
      <header class="border-b border-gray-800 bg-gray-950/90 backdrop-blur">
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div class="flex items-center gap-6">
            <a routerLink="/contracts" class="text-xl font-bold tracking-tight text-white">
              Contractzy
            </a>

            <nav class="flex items-center gap-2">
              <a
                routerLink="/contracts"
                routerLinkActive="bg-blue-600 text-white"
                [routerLinkActiveOptions]="{ exact: true }"
                class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-white"
              >
                Contracts
              </a>
              @if (authService.user()?.role !== 'viewer') {
                <a
                  routerLink="/contracts/create"
                  routerLinkActive="bg-blue-600 text-white"
                  class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-white"
                >
                  New Contract
                </a>
              }
            </nav>
          </div>

          <div class="flex items-center gap-3">

            <span
              class="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
              [ngClass]="roleBadgeClass()"
            >
              {{ authService.user()?.role }}
            </span>

            <button
              type="button"
              (click)="logout()"
              class="rounded-md border border-gray-700 px-3 py-2 text-sm font-medium text-gray-200 transition hover:border-gray-500 hover:bg-gray-800 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main class="mx-auto max-w-7xl px-6 py-8">
        <router-outlet />
      </main>
    </div>
  `
})
export class AppLayoutComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  roleBadgeClass(): string {
    switch (this.authService.user()?.role) {
      case 'admin':
        return 'bg-rose-500/15 text-rose-300';
      case 'bu':
        return 'bg-amber-500/15 text-amber-300';
      default:
        return 'bg-emerald-500/15 text-emerald-300';
    }
  }
}
