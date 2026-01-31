import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StakeholdersStore } from '../../state/stakeholders.store';
import { CreateStakeholderRequest } from '../../../../core/models/stakeholder.model';
import { StakeholderFormComponent } from '../../components/stakeholder-form/stakeholder-form.component';
import { StakeholderListComponent } from '../../components/stakeholder-list/stakeholder-list.component';

@Component({
  selector: 'app-stakeholders-page',
  standalone: true,
  imports: [CommonModule, StakeholderFormComponent, StakeholderListComponent],
  templateUrl: './stakeholders-page.page.html',
  styleUrl: './stakeholders-page.page.css'
})
export class StakeholdersPageComponent implements OnInit {
  readonly stakeholdersStore = inject(StakeholdersStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly stakeholders = this.stakeholdersStore.stakeholders;
  readonly status = this.stakeholdersStore.status;
  readonly error = this.stakeholdersStore.error;
  readonly isLoading = this.stakeholdersStore.isLoading;
  readonly isEmpty = this.stakeholdersStore.isEmpty;

  readonly toastMessage = signal<string | null>(null);

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.stakeholdersStore.loadStakeholders().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  handleCreate(request: CreateStakeholderRequest): void {
    this.stakeholdersStore
      .createStakeholder(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.stakeholdersStore.status() === 'success') {
          this.showToast('Beteiligte wurden gespeichert.');
        }
      });
  }

  private showToast(message: string): void {
    if (this.toastTimer) {
      window.clearTimeout(this.toastTimer);
    }
    this.toastMessage.set(message);
    this.toastTimer = window.setTimeout(() => {
      this.toastMessage.set(null);
    }, 3000);
  }
}
