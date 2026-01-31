import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StakeholdersStore } from '../../state/stakeholders.store';
import { CreateStakeholderRequest } from '../../../../core/models/stakeholder.model';
import { StakeholderFormComponent } from '../../components/stakeholder-form/stakeholder-form.component';
import { StakeholderListComponent } from '../../components/stakeholder-list/stakeholder-list.component';
import { ToastService } from '../../../../shared/ui/toast.service';

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
  private readonly toastService = inject(ToastService);

  readonly stakeholders = this.stakeholdersStore.stakeholders;
  readonly status = this.stakeholdersStore.status;
  readonly error = this.stakeholdersStore.error;
  readonly isLoading = this.stakeholdersStore.isLoading;
  readonly isEmpty = this.stakeholdersStore.isEmpty;

  ngOnInit(): void {
    this.stakeholdersStore.loadStakeholders().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  handleCreate(request: CreateStakeholderRequest): void {
    this.stakeholdersStore
      .createStakeholder(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.stakeholdersStore.status() === 'success') {
          this.toastService.success('Beteiligte wurden gespeichert.');
          return;
        }
        if (this.stakeholdersStore.status() === 'error') {
          const message =
            this.stakeholdersStore.error()?.message ?? 'Beteiligte konnten nicht gespeichert werden.';
          this.toastService.error(message);
        }
      });
  }
}
