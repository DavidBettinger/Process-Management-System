import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { ConfirmDialogService, DialogState } from './confirm-dialog.service';
import { TwButtonDirective } from '../tw/tw-button.directive';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, TwButtonDirective],
  templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent {
  private readonly confirmDialog = inject(ConfirmDialogService);
  readonly dialog = this.confirmDialog.dialog;

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: Event): void {
    const current = this.dialog();
    if (!(event instanceof KeyboardEvent)) {
      return;
    }
    if (!current || !current.closeOnEscape) {
      return;
    }
    event.preventDefault();
    this.cancel();
  }

  confirm(): void {
    this.confirmDialog.accept();
  }

  cancel(): void {
    this.confirmDialog.cancel();
  }

  handleBackdrop(): void {
    const current = this.dialog();
    if (!current || !current.closeOnBackdrop) {
      return;
    }
    this.cancel();
  }

  panelClass(current: DialogState): string {
    const base = 'w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl';
    return current.panelClass ? `${base} ${current.panelClass}` : `${base} max-w-md`;
  }
}
