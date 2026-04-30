import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <!-- Login Form -->
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 class="text-white text-2xl font-bold mb-6 text-center">Contractzy Login</h2>
        
        <div class="mb-4">
          <label class="block text-gray-400 text-sm mb-2">Email Address</label>
          <input formControlName="email" type="email" placeholder="email@contractzy.com" 
                 class="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none transition">
        </div>
        
        <div class="mb-6">
          <label class="block text-gray-400 text-sm mb-2">Password</label>
          <input formControlName="password" type="password" placeholder="••••••••" 
                 class="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none transition">
        </div>
        
        <button type="submit" [disabled]="loginForm.invalid" 
                class="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
          Sign In
        </button>

        <p class="text-gray-400 mt-6 text-sm text-center">
          Don't have an account? <a routerLink="/auth/signup" class="text-blue-400 hover:underline">Sign Up</a>
        </p>
      </form>

      <!-- Seeded Credentials Helper -->
      <!-- Seeded Credentials Helper -->
<div class="mt-8 w-full max-w-md bg-gray-800/50 border border-gray-700 rounded-lg p-6">
  <h3 class="text-blue-400 font-bold mb-4 flex items-center text-sm uppercase tracking-wider">
    <span class="mr-2">🧪</span> Development Test Accounts
  </h3>
  <div class="space-y-4">
    <!-- Admin -->
    <div class="text-xs">
      <p class="text-gray-300 font-bold mb-1">Admin (Full Access):</p>
      <!-- Change @ to &#64; here -->
      <code class="bg-black/30 p-1 rounded text-green-400">admin&#64;contractzy.com</code>
    </div>
    
    <!-- BU -->
    <div class="text-xs">
      <p class="text-gray-300 font-bold mb-1">Business User (Create/Review):</p>
      <!-- Change @ to &#64; here -->
      <code class="bg-black/30 p-1 rounded text-green-400">bu&#64;contractzy.com</code>
    </div>
    
    <!-- Viewer -->
    <div class="text-xs">
      <p class="text-gray-300 font-bold mb-1">Viewer (Read Only):</p>
      <!-- Change @ to &#64; here -->
      <code class="bg-black/30 p-1 rounded text-green-400">viewer&#64;contractzy.com</code>
    </div>
    
    <!-- Password -->
    <div class="pt-2 border-t border-gray-700">
      <p class="text-gray-400 text-xs">Universal Password:</p>
      <code class="text-yellow-500 font-mono">Password123!</code>
    </div>
  </div>
</div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: () => this.router.navigate(['/contracts']),
        error: (err) => alert(err.error?.error || 'Login failed')
      });
    }
  }
}