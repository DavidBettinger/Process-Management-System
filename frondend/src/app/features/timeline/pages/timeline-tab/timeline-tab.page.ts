import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TimelineGraphStore } from '../../state/timeline-graph.store';
import {
  TimelineGraphComponent,
  TimelineGraphNodeSelection
} from '../../components/timeline-graph/timeline-graph.component';
import { TwButtonDirective } from '../../../../shared/ui/tw/tw-button.directive';
import { TwCardComponent } from '../../../../shared/ui/tw/tw-card.component';
import { TimelineFloatingOverlayComponent } from '../../components/timeline-floating-overlay/timeline-floating-overlay.component';
import {
  TimelineOverlayPosition,
  TimelineOverlayPositionStore
} from '../../state/timeline-overlay-position.store';

@Component({
  selector: 'app-timeline-tab-page',
  standalone: true,
  imports: [CommonModule, TimelineGraphComponent, TimelineFloatingOverlayComponent, TwButtonDirective, TwCardComponent],
  templateUrl: './timeline-tab.page.html'
})
export class TimelineTabPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly timelineGraphStore = inject(TimelineGraphStore);
  readonly overlayPositionStore = inject(TimelineOverlayPositionStore);
  readonly overlayAnchor = signal<{ x: number; y: number } | null>(null);

  readonly status = this.timelineGraphStore.status;
  readonly error = this.timelineGraphStore.error;
  readonly isLoading = this.timelineGraphStore.isLoading;
  readonly graphDto = this.timelineGraphStore.graphDto;
  readonly renderModel = this.timelineGraphStore.renderModel;
  readonly selectedNodeId = this.timelineGraphStore.selectedNodeId;
  readonly selectedNodeType = this.timelineGraphStore.selectedNodeType;
  readonly selectedDetails = this.timelineGraphStore.selectedDetails;
  readonly rememberedOverlayPosition = this.overlayPositionStore.position;
  readonly overlayVisible = computed(
    () => !!this.selectedDetails() && (this.overlayAnchor() !== null || this.rememberedOverlayPosition() !== null)
  );
  readonly overlayAnchorValue = computed(() => this.overlayAnchor() ?? { x: 24, y: 24 });
  readonly meetingLegend = [
    { key: 'PLANNED', label: 'Termin geplant', swatchClass: 'bg-blue-100 border-blue-300' },
    { key: 'PERFORMED', label: 'Termin durchgefuehrt', swatchClass: 'bg-emerald-100 border-emerald-300' }
  ];
  readonly taskLegend = [
    { key: 'OPEN', label: 'Aufgabe offen', swatchClass: 'bg-slate-100 border-slate-300' },
    { key: 'ASSIGNED', label: 'Aufgabe zugewiesen', swatchClass: 'bg-blue-100 border-blue-300' },
    { key: 'IN_PROGRESS', label: 'Aufgabe in Bearbeitung', swatchClass: 'bg-amber-100 border-amber-300' },
    { key: 'BLOCKED', label: 'Aufgabe blockiert', swatchClass: 'bg-rose-100 border-rose-300' },
    { key: 'RESOLVED', label: 'Aufgabe erledigt', swatchClass: 'bg-emerald-100 border-emerald-300' },
    { key: 'OVERDUE', label: 'Ueberfaellig (hat Vorrang)', swatchClass: 'bg-rose-200 border-rose-400' }
  ];
  readonly isEmpty = computed(
    () => this.status() === 'success' && this.renderModel().nodes.length === 0 && this.renderModel().edges.length === 0
  );

  ngOnInit(): void {
    const parentRoute = this.route.parent ?? this.route;
    parentRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const caseId = params.get('caseId');
      if (caseId) {
        this.overlayAnchor.set(null);
        this.timelineGraphStore.setCaseId(caseId);
        this.timelineGraphStore.loadTimelineGraph().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
      }
    });
  }

  retry(): void {
    this.timelineGraphStore.loadTimelineGraph().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  onNodeSelected(selection: TimelineGraphNodeSelection): void {
    this.overlayAnchor.set(selection.anchor);
    this.timelineGraphStore.selectNode(selection.nodeId, selection.nodeType);
  }

  onOverlayPositionChanged(position: TimelineOverlayPosition): void {
    this.overlayPositionStore.setPosition(position);
  }

  clearSelection(): void {
    this.overlayAnchor.set(null);
    this.timelineGraphStore.clearSelection();
  }
}
