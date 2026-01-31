import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TimelineStore } from '../../state/timeline.store';
import { TimelineListComponent } from '../../components/timeline-list/timeline-list.component';

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
      }
      void this.timelineStore.loadTimeline();
    });
  }

  retry(): void {
    void this.timelineStore.loadTimeline();
  }
}

const toTime = (value: string): number => {
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
};
