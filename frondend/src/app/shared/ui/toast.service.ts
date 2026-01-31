import { Injectable, computed, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  variant: ToastVariant;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastState = signal<ToastMessage[]>([]);
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  readonly toasts = computed(() => this.toastState());

  show(message: string, variant: ToastVariant = 'info', durationMs = 3000): string {
    const id = `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    this.toastState.update((current) => [...current, { id, message, variant }]);
    if (durationMs > 0) {
      const timer = window.setTimeout(() => this.dismiss(id), durationMs);
      this.timers.set(id, timer);
    }
    return id;
  }

  success(message: string, durationMs = 3000): string {
    return this.show(message, 'success', durationMs);
  }

  error(message: string, durationMs = 4000): string {
    return this.show(message, 'error', durationMs);
  }

  info(message: string, durationMs = 3000): string {
    return this.show(message, 'info', durationMs);
  }

  dismiss(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      window.clearTimeout(timer);
      this.timers.delete(id);
    }
    this.toastState.update((current) => current.filter((toast) => toast.id !== id));
  }

  clear(): void {
    this.timers.forEach((timer) => window.clearTimeout(timer));
    this.timers.clear();
    this.toastState.set([]);
  }
}
