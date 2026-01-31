import { Injectable, computed, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { finalize, take } from 'rxjs/operators';

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

export interface ConfirmDialogState extends ConfirmDialogOptions {
  id: string;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly dialogState = signal<ConfirmDialogState | null>(null);
  private pendingResponse: Subject<boolean> | null = null;

  readonly dialog = computed(() => this.dialogState());

  confirm(options: ConfirmDialogOptions): Observable<boolean> {
    if (this.pendingResponse) {
      this.pendingResponse.next(false);
      this.pendingResponse.complete();
    }
    const response = new Subject<boolean>();
    this.pendingResponse = response;
    this.dialogState.set({
      id: `confirm-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      confirmLabel: options.confirmLabel ?? 'Bestaetigen',
      cancelLabel: options.cancelLabel ?? 'Abbrechen',
      destructive: options.destructive ?? false,
      title: options.title,
      message: options.message
    });
    return response.asObservable().pipe(
      take(1),
      finalize(() => {
        if (this.pendingResponse === response) {
          this.pendingResponse = null;
          this.dialogState.set(null);
        }
      })
    );
  }

  accept(): void {
    this.resolve(true);
  }

  cancel(): void {
    this.resolve(false);
  }

  private resolve(value: boolean): void {
    if (!this.pendingResponse) {
      this.dialogState.set(null);
      return;
    }
    this.pendingResponse.next(value);
    this.pendingResponse.complete();
  }
}
