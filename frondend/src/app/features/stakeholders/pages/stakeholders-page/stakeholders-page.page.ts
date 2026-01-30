import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
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

  readonly stakeholders = this.stakeholdersStore.stakeholders;
  readonly status = this.stakeholdersStore.status;
  readonly error = this.stakeholdersStore.error;
  readonly isLoading = this.stakeholdersStore.isLoading;
  readonly isEmpty = this.stakeholdersStore.isEmpty;

  readonly toastMessage = signal<string | null>(null);

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    void this.stakeholdersStore.loadStakeholders();
  }

  async handleCreate(request: CreateStakeholderRequest): Promise<void> {
    await this.stakeholdersStore.createStakeholder(request);
    if (this.stakeholdersStore.status() === 'success') {
      this.showToast('Beteiligte wurden gespeichert.');
    }
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
