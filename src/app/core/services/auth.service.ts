import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { tap } from 'rxjs';

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'bu' | 'viewer';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private readonly userStorageKey = 'user';

  private readonly _user = signal<User | null>(this.getStoredUser());
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = signal(!!localStorage.getItem('token'));

  getToken() { return localStorage.getItem('token'); }
  getRefreshToken() { return localStorage.getItem('refreshToken'); }

  login(credentials: any) {
    return this.api.post<{ token: string, refreshToken: string, user: User }>(API_ENDPOINTS.AUTH.LOGIN, credentials)
      .pipe(tap(res => this.setSession(res)));
  }

  signup(data: any) {
    return this.api.post<{ token: string, user: User }>(API_ENDPOINTS.AUTH.SIGNUP, data);
  }

  refreshToken() {
    return this.api.post<{ token: string }>(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken: this.getRefreshToken()
    }).pipe(tap(res => localStorage.setItem('token', res.token)));
  }

  private setSession(res: any) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('refreshToken', res.refreshToken);
    localStorage.setItem(this.userStorageKey, JSON.stringify(res.user));
    this._user.set(res.user);
    this.isAuthenticated.set(true);
  }

  logout() {
    localStorage.clear();
    this._user.set(null);
    this.isAuthenticated.set(false);
  }

  private getStoredUser(): User | null {
    const storedUser = localStorage.getItem(this.userStorageKey);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      localStorage.removeItem(this.userStorageKey);
      return null;
    }
  }
}
