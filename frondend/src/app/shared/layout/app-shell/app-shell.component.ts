import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ConfirmDialogComponent } from '../../ui/confirm-dialog/confirm-dialog.component';
import { ToastHostComponent } from '../../ui/toast/toast-host.component';
import { TwButtonDirective } from '../../ui/tw/tw-button.directive';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    ToastHostComponent,
    ConfirmDialogComponent,
    TwButtonDirective
  ],
  templateUrl: './app-shell.component.html'
})
export class AppShellComponent {}
