import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TimelineStore } from '../../state/timeline.store';
import { TimelineListComponent } from '../../components/timeline-list/timeline-list.component';
import { TasksStore } from '../../../tasks/state/tasks.store';
import { StakeholdersStore } from '../../../stakeholders/state/stakeholders.store';
import { LocationsStore } from '../../../locations/state/locations.store';

@Component({
  selector: 'app-timeline-tab-page',
  standalone: true,
  imports: [CommonModule, TimelineListComponent],
  templateUrl: './timeline-tab.page.html',
  styleUrl: './timeline-tab.page.css'
})
export class TimelineTabPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly timelineStore = inject(TimelineStore);
  readonly tasksStore = inject(TasksStore);
  readonly stakeholdersStore = inject(StakeholdersStore);
  readonly locationsStore = inject(LocationsStore);

  readonly timeline = this.timelineStore.timeline;
  readonly status = this.timelineStore.status;
  readonly error = this.timelineStore.error;
  readonly isLoading = this.timelineStore.isLoading;
  readonly isEmpty = this.timelineStore.isEmpty;

  readonly entries = computed(() => {
    const list = this.timeline()?.entries ?? [];
    return [...list].sort((a, b) => toTime(a.occurredAt) - toTime(b.occurredAt));
  });

  ngOnInit(): void {
    const parentRoute = this.route.parent ?? this.route;
    parentRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const caseId = params.get('caseId');
      if (caseId) {
        this.timelineStore.setCaseId(caseId);
        this.tasksStore.setCaseId(caseId);
        this.tasksStore.loadTasks().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
      }
      this.timelineStore.loadTimeline().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    });
    this.stakeholdersStore.loadStakeholders().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.locationsStore.loadLocations().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  retry(): void {
    this.timelineStore.loadTimeline().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}

const toTime = (value: string): number => {
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
};
