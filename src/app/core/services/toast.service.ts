import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private _toast = signal<ToastMessage | null>(null);
  readonly currentToast = this._toast.asReadonly();

  showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this._toast.set({ message, type });
    setTimeout(() => this._toast.set(null), 3000);
  }
}
