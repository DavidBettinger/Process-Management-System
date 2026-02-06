import { TestBed } from '@angular/core/testing';
import {
  computeOverlayPlacement,
  TimelineFloatingOverlayComponent
} from './timeline-floating-overlay.component';

describe('TimelineFloatingOverlayComponent', () => {
  it('renders task details and closes on close button', () => {
    TestBed.configureTestingModule({
      imports: [TimelineFloatingOverlayComponent]
    });

    const fixture = TestBed.createComponent(TimelineFloatingOverlayComponent);
    fixture.componentRef.setInput('anchor', { x: 200, y: 180 });
    fixture.componentRef.setInput('details', {
      type: 'task',
      nodeId: 'meeting:m1:task:t1',
      title: 'Konzeptentwurf vorbereiten',
      statusLabel: 'Offen',
      priorityLabel: 'P2',
      assigneeLabel: 'Anna L. — Beratung'
    });
    fixture.detectChanges();

    const component = fixture.componentInstance;
    let closeCalls = 0;
    component.closed.subscribe(() => {
      closeCalls += 1;
    });

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[data-testid="timeline-floating-overlay-task"]')).not.toBeNull();
    expect(root.textContent).toContain('Konzeptentwurf vorbereiten');

    const closeButton = root.querySelector('[data-testid="timeline-floating-overlay-close"]') as HTMLButtonElement;
    closeButton.click();
    expect(closeCalls).toBe(1);
  });

  it('closes on escape and backdrop click', () => {
    TestBed.configureTestingModule({
      imports: [TimelineFloatingOverlayComponent]
    });

    const fixture = TestBed.createComponent(TimelineFloatingOverlayComponent);
    fixture.componentRef.setInput('anchor', { x: 160, y: 140 });
    fixture.componentRef.setInput('details', {
      type: 'meeting',
      nodeId: 'meeting:m1',
      title: 'Kickoff',
      dateLabel: '20.02.2026 11:06',
      locationLabel: 'Kita Langballig',
      participantLabels: ['Anna L. — Beratung']
    });
    fixture.detectChanges();

    const component = fixture.componentInstance;
    let closeCalls = 0;
    component.closed.subscribe(() => {
      closeCalls += 1;
    });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(closeCalls).toBe(1);

    const backdrop = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="timeline-floating-overlay-backdrop"]'
    ) as HTMLDivElement;
    backdrop.click();
    expect(closeCalls).toBe(2);
  });

  it('uses left placement class when anchored near right edge', () => {
    TestBed.configureTestingModule({
      imports: [TimelineFloatingOverlayComponent]
    });

    const fixture = TestBed.createComponent(TimelineFloatingOverlayComponent);
    fixture.componentRef.setInput('anchor', { x: 2000, y: 100 });
    fixture.componentRef.setInput('details', {
      type: 'stakeholder',
      nodeId: 'meeting:m1:stakeholder:s1',
      fullName: 'Anna L.',
      roleLabel: 'Beratung',
      relatedMeetingLabel: 'Kickoff (20.02.2026 11:06)'
    });
    fixture.detectChanges();

    const overlay = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="timeline-floating-overlay"]'
    ) as HTMLElement;
    expect(overlay.classList.contains('overlay-left')).toBe(true);
  });

  it('emits updated position while dragging and moves the panel', () => {
    TestBed.configureTestingModule({
      imports: [TimelineFloatingOverlayComponent]
    });

    const fixture = TestBed.createComponent(TimelineFloatingOverlayComponent);
    fixture.componentRef.setInput('anchor', { x: 200, y: 180 });
    fixture.componentRef.setInput('details', {
      type: 'task',
      nodeId: 'meeting:m1:task:t1',
      title: 'Konzeptentwurf vorbereiten',
      statusLabel: 'Offen',
      priorityLabel: 'P2',
      assigneeLabel: 'Anna L. — Beratung'
    });
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const emitted: Array<{ left: number; top: number }> = [];
    component.positionChanged.subscribe((position) => emitted.push(position));

    const root = fixture.nativeElement as HTMLElement;
    const overlay = root.querySelector('[data-testid="timeline-floating-overlay"]') as HTMLElement;
    const initialLeft = parseInt(overlay.style.left || '0', 10);
    const initialTop = parseInt(overlay.style.top || '0', 10);
    const dragHandle = root.querySelector('[data-testid="timeline-floating-overlay-drag-handle"]') as HTMLElement;

    dispatchPointerEvent(dragHandle, 'pointerdown', initialLeft + 10, initialTop + 10, 1);
    dispatchPointerEvent(document, 'pointermove', initialLeft + 180, initialTop + 160, 1);
    fixture.detectChanges();
    dispatchPointerEvent(document, 'pointerup', initialLeft + 180, initialTop + 160, 1);

    const movedLeft = parseInt(overlay.style.left || '0', 10);
    const movedTop = parseInt(overlay.style.top || '0', 10);
    expect(movedLeft).toBeGreaterThan(initialLeft);
    expect(movedTop).toBeGreaterThan(initialTop);
    expect(emitted.length).toBeGreaterThan(0);
  });
});

describe('computeOverlayPlacement', () => {
  it('flips left and up when placement overflows viewport', () => {
    const placement = computeOverlayPlacement(
      { x: 980, y: 740 },
      { width: 1024, height: 768 },
      { width: 360, height: 272 }
    );

    expect(placement.horizontal).toBe('left');
    expect(placement.vertical).toBe('up');
    expect(placement.left).toBeGreaterThanOrEqual(12);
    expect(placement.top).toBeGreaterThanOrEqual(12);
  });

  it('uses remembered position when provided', () => {
    const placement = computeOverlayPlacement(
      { x: 300, y: 200 },
      { width: 1200, height: 800 },
      { width: 360, height: 272 },
      { left: 444, top: 222 }
    );

    expect(placement.left).toBe(444);
    expect(placement.top).toBe(222);
  });
});

const dispatchPointerEvent = (
  target: EventTarget,
  type: string,
  clientX: number,
  clientY: number,
  pointerId: number
): void => {
  const event = new Event(type, { bubbles: true, cancelable: true }) as PointerEvent;
  Object.defineProperty(event, 'clientX', { value: clientX });
  Object.defineProperty(event, 'clientY', { value: clientY });
  Object.defineProperty(event, 'pointerId', { value: pointerId });
  target.dispatchEvent(event);
};
