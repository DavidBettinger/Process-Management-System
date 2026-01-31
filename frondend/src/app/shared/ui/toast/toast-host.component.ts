import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastMessage, ToastService } from '../toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-host.component.html',
  styleUrl: './toast-host.component.css'
})
export class ToastHostComponent {
  private readonly toastService = inject(ToastService);
  readonly toasts = this.toastService.toasts;

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }

  trackById(index: number, toast: ToastMessage): string {
    return toast.id ?? `${index}`;
  }
}
