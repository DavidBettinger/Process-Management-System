import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ConfirmDialogService } from './confirm-dialog.service';
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

  confirm(): void {
    this.confirmDialog.accept();
  }

  cancel(): void {
    this.confirmDialog.cancel();
  }
}
