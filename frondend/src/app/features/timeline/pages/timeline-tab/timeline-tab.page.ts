import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TimelineGraphStore } from '../../state/timeline-graph.store';
import { TimelineGraphComponent } from '../../components/timeline-graph/timeline-graph.component';
import { TwButtonDirective } from '../../../../shared/ui/tw/tw-button.directive';
import { TwCardComponent } from '../../../../shared/ui/tw/tw-card.component';

@Component({
  selector: 'app-timeline-tab-page',
  standalone: true,
  imports: [CommonModule, TimelineGraphComponent, TwButtonDirective, TwCardComponent],
  templateUrl: './timeline-tab.page.html'
})
export class TimelineTabPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly timelineGraphStore = inject(TimelineGraphStore);

  readonly status = this.timelineGraphStore.status;
  readonly error = this.timelineGraphStore.error;
  readonly isLoading = this.timelineGraphStore.isLoading;
  readonly graphDto = this.timelineGraphStore.graphDto;
  readonly renderModel = this.timelineGraphStore.renderModel;
  readonly isEmpty = computed(
    () => this.status() === 'success' && this.renderModel().nodes.length === 0 && this.renderModel().edges.length === 0
  );

  ngOnInit(): void {
    const parentRoute = this.route.parent ?? this.route;
    parentRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const caseId = params.get('caseId');
      if (caseId) {
        this.timelineGraphStore.setCaseId(caseId);
        this.timelineGraphStore.loadTimelineGraph().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
      }
    });
  }

  retry(): void {
    this.timelineGraphStore.loadTimelineGraph().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}
