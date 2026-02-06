import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TimelineGraphStore } from '../../state/timeline-graph.store';
import { TimelineGraphComponent } from '../../components/timeline-graph/timeline-graph.component';
import { TwButtonDirective } from '../../../../shared/ui/tw/tw-button.directive';
import { TwCardComponent } from '../../../../shared/ui/tw/tw-card.component';
import { TimelineGraphNodeType } from '../../../../core/models/timeline-graph.model';

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
  readonly selectedNodeId = this.timelineGraphStore.selectedNodeId;
  readonly selectedNodeType = this.timelineGraphStore.selectedNodeType;
  readonly selectedDetails = this.timelineGraphStore.selectedDetails;
  readonly meetingDetails = computed(() => {
    const details = this.selectedDetails();
    return details?.type === 'meeting' ? details : null;
  });
  readonly taskDetails = computed(() => {
    const details = this.selectedDetails();
    return details?.type === 'task' ? details : null;
  });
  readonly stakeholderDetails = computed(() => {
    const details = this.selectedDetails();
    return details?.type === 'stakeholder' ? details : null;
  });
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

  onNodeSelected(selection: { nodeId: string; nodeType: TimelineGraphNodeType }): void {
    this.timelineGraphStore.selectNode(selection.nodeId, selection.nodeType);
  }

  clearSelection(): void {
    this.timelineGraphStore.clearSelection();
  }
}
