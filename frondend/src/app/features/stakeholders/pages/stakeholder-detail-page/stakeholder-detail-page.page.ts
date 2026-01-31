import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StakeholderDetailStore } from '../../state/stakeholder-detail.store';
import { StakeholderRole } from '../../../../core/models/stakeholder.model';
import { TaskState } from '../../../../core/models/task.model';
import { CasesStore } from '../../../cases/state/cases.store';
import { ProcessLabelPipe } from '../../../../shared/labels/process-label.pipe';

@Component({
  selector: 'app-stakeholder-detail-page',
  standalone: true,
  imports: [CommonModule, ProcessLabelPipe],
  templateUrl: './stakeholder-detail-page.page.html',
  styleUrl: './stakeholder-detail-page.page.css'
})
export class StakeholderDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly store = inject(StakeholderDetailStore);
  readonly casesStore = inject(CasesStore);

  readonly profile = this.store.profile;
  readonly profileStatus = this.store.profileStatus;
  readonly profileError = this.store.profileError;
  readonly tasks = this.store.tasks;
  readonly tasksStatus = this.store.tasksStatus;
  readonly tasksError = this.store.tasksError;
  readonly page = this.store.page;
  readonly size = this.store.size;
  readonly totalItems = this.store.totalItems;
  readonly totalPages = this.store.totalPages;
  readonly hasNext = this.store.hasNext;
  readonly hasPrev = this.store.hasPrev;

  readonly pageSizes = [10, 20, 50];

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const stakeholderId = params.get('stakeholderId');
      if (!stakeholderId) {
        return;
      }
      this.store.setStakeholderId(stakeholderId);
      this.store.loadProfile().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
      this.store.loadTasks().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    });
    this.casesStore.loadCases().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  headerTitle(): string {
    const profile = this.profile();
    if (profile) {
      return `${profile.firstName} ${profile.lastName} — ${this.roleLabel(profile.role)}`;
    }
    if (this.profileStatus() === 'loading') {
      return 'Beteiligte werden geladen';
    }
    return 'Beteiligte';
  }

  roleLabel(role: StakeholderRole | null | undefined): string {
    if (!role) {
      return 'Unbekannte Rolle';
    }
    switch (role) {
      case 'CONSULTANT':
        return 'Beratung';
      case 'DIRECTOR':
        return 'Leitung';
      case 'TEAM_MEMBER':
        return 'Teammitglied';
      case 'SPONSOR':
        return 'Traeger';
      case 'EXTERNAL':
        return 'Extern';
      default:
        return role;
    }
  }

  stateLabel(state: TaskState): string {
    switch (state) {
      case 'OPEN':
        return 'Offen';
      case 'ASSIGNED':
        return 'Zugewiesen';
      case 'IN_PROGRESS':
        return 'In Arbeit';
      case 'BLOCKED':
        return 'Blockiert';
      case 'RESOLVED':
        return 'Abgeschlossen';
      default:
        return state;
    }
  }

  dueDateLabel(dueDate?: string | null): string {
    return dueDate && dueDate.length > 0 ? dueDate : 'Kein Termin';
  }

  prevPage(): void {
    this.store.prevPage().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  nextPage(): void {
    this.store.nextPage().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  handlePageSizeChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    if (Number.isNaN(value)) {
      return;
    }
    this.store.setPageSize(value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}
