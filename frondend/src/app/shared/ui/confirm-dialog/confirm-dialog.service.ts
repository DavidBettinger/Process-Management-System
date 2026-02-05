import { Injectable, TemplateRef, computed, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { finalize, take } from 'rxjs/operators';

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  panelClass?: string;
}

export interface ConfirmDialogState extends ConfirmDialogOptions {
  id: string;
  kind: 'confirm';
  closeOnBackdrop: boolean;
  closeOnEscape: boolean;
}

export interface TemplateDialogContext {
  close: () => void;
}

export interface TemplateDialogOptions {
  title: string;
  template: TemplateRef<TemplateDialogContext>;
  panelClass?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

export interface TemplateDialogState extends TemplateDialogOptions {
  id: string;
  kind: 'template';
  context: TemplateDialogContext;
  closeOnBackdrop: boolean;
  closeOnEscape: boolean;
}

export type DialogState = ConfirmDialogState | TemplateDialogState;

export interface DialogRef {
  close: () => void;
  afterClosed: Observable<void>;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly dialogState = signal<DialogState | null>(null);
  private pendingResponse: Subject<boolean> | null = null;
  private activeTemplateClose: (() => void) | null = null;

  readonly dialog = computed(() => this.dialogState());

  confirm(options: ConfirmDialogOptions): Observable<boolean> {
    this.dismissActiveDialog();
    const response = new Subject<boolean>();
    this.pendingResponse = response;
    this.dialogState.set({
      id: `confirm-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      kind: 'confirm',
      confirmLabel: options.confirmLabel ?? 'Bestaetigen',
      cancelLabel: options.cancelLabel ?? 'Abbrechen',
      destructive: options.destructive ?? false,
      closeOnBackdrop: options.closeOnBackdrop ?? true,
      closeOnEscape: options.closeOnEscape ?? true,
      panelClass: options.panelClass,
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

  openTemplate(options: TemplateDialogOptions): DialogRef {
    this.dismissActiveDialog();
    const id = `template-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const closed$ = new Subject<void>();
    const close = () => {
      if (this.dialogState()?.id === id) {
        this.dialogState.set(null);
      }
      if (!closed$.closed) {
        closed$.next();
        closed$.complete();
      }
      if (this.activeTemplateClose === close) {
        this.activeTemplateClose = null;
      }
    };
    this.activeTemplateClose = close;
    const context: TemplateDialogContext = { close };
    this.dialogState.set({
      id,
      kind: 'template',
      title: options.title,
      template: options.template,
      context,
      panelClass: options.panelClass,
      closeOnBackdrop: options.closeOnBackdrop ?? true,
      closeOnEscape: options.closeOnEscape ?? true
    });
    return {
      close,
      afterClosed: closed$.asObservable()
    };
  }

  accept(): void {
    this.resolve(true);
  }

  cancel(): void {
    const current = this.dialogState();
    if (!current) {
      return;
    }
    if (current.kind === 'template') {
      this.activeTemplateClose?.();
      return;
    }
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

  private dismissActiveDialog(): void {
    if (this.pendingResponse) {
      this.pendingResponse.next(false);
      this.pendingResponse.complete();
      this.pendingResponse = null;
    }
    this.activeTemplateClose?.();
    this.activeTemplateClose = null;
    this.dialogState.set(null);
  }
}
