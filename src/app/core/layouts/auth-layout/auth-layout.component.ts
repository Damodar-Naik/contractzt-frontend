import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-950 text-white">
      <header class="border-b border-gray-800">
        <div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <p class="text-lg font-bold tracking-tight">Contractzy</p>
            <p class="text-sm text-gray-400">Contract workflow and review portal</p>
          </div>
        </div>
      </header>

      <main>
        <router-outlet />
      </main>
    </div>
  `
})
export class AuthLayoutComponent {}
