import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Output, computed, input, signal } from '@angular/core';
import { TimelineGraphSelectionDetails } from '../../state/timeline-graph.store';
import { TimelineOverlayPosition } from '../../state/timeline-overlay-position.store';

interface OverlayAnchor {
  x: number;
  y: number;
}

interface OverlayViewport {
  width: number;
  height: number;
}

interface OverlaySize {
  width: number;
  height: number;
}

interface OverlayPlacement {
  left: number;
  top: number;
  horizontal: 'left' | 'right';
  vertical: 'up' | 'down';
  width: number;
}

interface OverlayDragState {
  pointerId: number;
  offsetX: number;
  offsetY: number;
}

const OVERLAY_OFFSET = 14;
const OVERLAY_MARGIN = 12;
const DEFAULT_OVERLAY_SIZE: OverlaySize = {
  width: 360,
  height: 272
};
const MIN_OVERLAY_WIDTH = 280;

@Component({
  selector: 'app-timeline-floating-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline-floating-overlay.component.html'
})
export class TimelineFloatingOverlayComponent {
  readonly anchor = input.required<OverlayAnchor>();
  readonly details = input.required<TimelineGraphSelectionDetails | null>();
  readonly rememberedPosition = input<TimelineOverlayPosition | null>(null);
  @Output() closed = new EventEmitter<void>();
  @Output() positionChanged = new EventEmitter<TimelineOverlayPosition>();

  private readonly manualPosition = signal<TimelineOverlayPosition | null>(null);
  private readonly dragState = signal<OverlayDragState | null>(null);

  readonly placement = computed(() =>
    computeOverlayPlacement(
      this.anchor(),
      currentViewport(),
      DEFAULT_OVERLAY_SIZE,
      this.manualPosition() ?? this.rememberedPosition()
    )
  );
  readonly panelStyles = computed(() => ({
    'left.px': this.placement().left,
    'top.px': this.placement().top,
    'width.px': this.placement().width
  }));

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') {
      return;
    }
    event.preventDefault();
    this.close();
  }

  onBackdropClick(): void {
    this.close();
  }

  onPanelClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  onDragHandlePointerDown(event: PointerEvent): void {
    event.stopPropagation();
    event.preventDefault();
    const placement = this.placement();
    this.dragState.set({
      pointerId: event.pointerId,
      offsetX: event.clientX - placement.left,
      offsetY: event.clientY - placement.top
    });
    this.manualPosition.set({ left: placement.left, top: placement.top });
  }

  @HostListener('document:pointermove', ['$event'])
  onDocumentPointerMove(event: PointerEvent): void {
    const drag = this.dragState();
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }
    const placement = this.placement();
    const viewport = currentViewport();
    const next = clampPanelPosition(
      {
        left: event.clientX - drag.offsetX,
        top: event.clientY - drag.offsetY
      },
      viewport,
      placement.width,
      DEFAULT_OVERLAY_SIZE.height
    );
    this.manualPosition.set(next);
    this.positionChanged.emit(next);
    event.preventDefault();
  }

  @HostListener('document:pointerup', ['$event'])
  onDocumentPointerUp(event: PointerEvent): void {
    const drag = this.dragState();
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }
    this.dragState.set(null);
  }

  @HostListener('document:pointercancel', ['$event'])
  onDocumentPointerCancel(event: PointerEvent): void {
    const drag = this.dragState();
    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }
    this.dragState.set(null);
  }

  close(): void {
    this.closed.emit();
  }

  nodeTypeLabel(details: TimelineGraphSelectionDetails | null): string {
    if (!details) {
      return '';
    }
    if (details.type === 'meeting') {
      return 'Termin';
    }
    if (details.type === 'task') {
      return 'Aufgabe';
    }
    return 'Beteiligte Person';
  }
}

export const computeOverlayPlacement = (
  anchor: OverlayAnchor,
  viewport: OverlayViewport,
  overlaySize: OverlaySize = DEFAULT_OVERLAY_SIZE,
  preferredPosition: TimelineOverlayPosition | null = null
): OverlayPlacement => {
  const width = Math.min(
    overlaySize.width,
    Math.max(MIN_OVERLAY_WIDTH, viewport.width - OVERLAY_MARGIN * 2)
  );
  const maxLeft = Math.max(OVERLAY_MARGIN, viewport.width - width - OVERLAY_MARGIN);
  const maxTop = Math.max(OVERLAY_MARGIN, viewport.height - overlaySize.height - OVERLAY_MARGIN);

  if (preferredPosition) {
    const left = clamp(preferredPosition.left, OVERLAY_MARGIN, maxLeft);
    const top = clamp(preferredPosition.top, OVERLAY_MARGIN, maxTop);
    return {
      left,
      top,
      horizontal: left + width / 2 > anchor.x ? 'left' : 'right',
      vertical: top > anchor.y ? 'down' : 'up',
      width
    };
  }

  let horizontal: 'left' | 'right' = 'right';
  let left = anchor.x + OVERLAY_OFFSET;
  if (left + width + OVERLAY_MARGIN > viewport.width) {
    horizontal = 'left';
    left = anchor.x - width - OVERLAY_OFFSET;
  }
  left = clamp(left, OVERLAY_MARGIN, maxLeft);

  let vertical: 'up' | 'down' = 'down';
  let top = anchor.y + OVERLAY_OFFSET;
  if (top + overlaySize.height + OVERLAY_MARGIN > viewport.height) {
    vertical = 'up';
    top = anchor.y - overlaySize.height - OVERLAY_OFFSET;
  }
  top = clamp(top, OVERLAY_MARGIN, maxTop);

  return {
    left,
    top,
    horizontal,
    vertical,
    width
  };
};

const currentViewport = (): OverlayViewport => ({
  width: typeof window !== 'undefined' ? window.innerWidth : 1280,
  height: typeof window !== 'undefined' ? window.innerHeight : 720
});

const clampPanelPosition = (
  position: TimelineOverlayPosition,
  viewport: OverlayViewport,
  width: number,
  height: number
): TimelineOverlayPosition => ({
  left: clamp(position.left, OVERLAY_MARGIN, Math.max(OVERLAY_MARGIN, viewport.width - width - OVERLAY_MARGIN)),
  top: clamp(position.top, OVERLAY_MARGIN, Math.max(OVERLAY_MARGIN, viewport.height - height - OVERLAY_MARGIN))
});

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);
