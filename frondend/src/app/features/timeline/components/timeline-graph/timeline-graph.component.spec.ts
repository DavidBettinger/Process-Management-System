import { TestBed } from '@angular/core/testing';
import {
  TimelineGraphRenderModel,
  TimelineGraphResponse
} from '../../../../core/models/timeline-graph.model';
import {
  endPan,
  initialPanState,
  movePan,
  startPan,
  TimelineGraphComponent,
  zoomPan,
  ZOOM_MAX,
  ZOOM_MIN
} from './timeline-graph.component';

describe('TimelineGraphComponent', () => {
  const graphDtoFixture: TimelineGraphResponse = {
    caseId: 'case-1',
    generatedAt: '2026-02-06T12:00:00Z',
    now: '2026-02-06T12:00:00Z',
    meetings: [{
      id: 'meeting-1',
      status: 'PLANNED',
      plannedAt: '2026-02-20T11:06:00Z',
      performedAt: null,
      title: 'Kickoff',
      locationLabel: 'Kita Langballig',
      participantStakeholderIds: ['st-1']
    }],
    stakeholders: [{
      id: 'st-1',
      firstName: 'Anna',
      lastName: 'L.',
      role: 'CONSULTANT'
    }],
    tasks: [{
      id: 'task-1',
      title: 'Konzeptentwurf vorbereiten',
      state: 'OPEN',
      priority: 2,
      assigneeId: 'st-1',
      createdFromMeetingId: 'meeting-1',
      dueDate: '2026-02-28'
    }]
  };

  const renderModelFixture: TimelineGraphRenderModel = {
    nodes: [
      {
        id: 'meeting:meeting-1',
        type: 'meeting',
        meetingId: 'meeting-1',
        graphAt: '2026-02-20T11:06:00Z',
        label: 'Kickoff — Kita Langballig'
      },
      {
        id: 'meeting:meeting-1:task:task-1',
        type: 'task',
        taskId: 'task-1',
        meetingId: 'meeting-1',
        assigneeId: 'st-1',
        label: 'Konzeptentwurf vorbereiten'
      },
      {
        id: 'meeting:meeting-1:stakeholder:st-1',
        type: 'stakeholder',
        stakeholderId: 'st-1',
        meetingId: 'meeting-1',
        label: 'Anna L. — CONSULTANT'
      }
    ],
    edges: [
      {
        id: 'edge:meeting:meeting-1:task:task-1:created-from',
        type: 'created-from',
        sourceId: 'meeting:meeting-1',
        targetId: 'meeting:meeting-1:task:task-1'
      },
      {
        id: 'edge:meeting:meeting-1:stakeholder:st-1:participation',
        type: 'participation',
        sourceId: 'meeting:meeting-1',
        targetId: 'meeting:meeting-1:stakeholder:st-1'
      },
      {
        id: 'edge:task:task-1:stakeholder:st-1:assignment',
        type: 'assignment',
        sourceId: 'meeting:meeting-1:task:task-1',
        targetId: 'meeting:meeting-1:stakeholder:st-1'
      }
    ]
  };

  it('renders meeting labels and today marker', () => {
    TestBed.configureTestingModule({
      imports: [TimelineGraphComponent]
    });

    const fixture = TestBed.createComponent(TimelineGraphComponent);
    fixture.componentRef.setInput('graphDto', graphDtoFixture);
    fixture.componentRef.setInput('renderModel', renderModelFixture);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('20.02.2026 11:06 — Kita Langballig');
    expect(compiled.textContent).toContain('Heute');
    expect(compiled.querySelector('[data-testid="today-marker-line"]')).not.toBeNull();
  });

  it('does not render raw ids', () => {
    TestBed.configureTestingModule({
      imports: [TimelineGraphComponent]
    });

    const fixture = TestBed.createComponent(TimelineGraphComponent);
    fixture.componentRef.setInput('graphDto', graphDtoFixture);
    fixture.componentRef.setInput('renderModel', renderModelFixture);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('meeting-1');
    expect(text).not.toContain('task-1');
    expect(text).not.toContain('st-1');
  });

  it('updates pan transform on pointer drag', () => {
    TestBed.configureTestingModule({
      imports: [TimelineGraphComponent]
    });

    const fixture = TestBed.createComponent(TimelineGraphComponent);
    fixture.componentRef.setInput('graphDto', graphDtoFixture);
    fixture.componentRef.setInput('renderModel', renderModelFixture);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const svg = root.querySelector('[data-testid="timeline-graph-svg"]') as SVGElement;
    const panLayer = root.querySelector('[data-testid="timeline-pan-layer"]') as SVGGElement;
    expect(panLayer.getAttribute('transform')).toBe('translate(0,0) scale(1)');

    dispatchPointerEvent(svg, 'pointerdown', 100, 120, 1);
    dispatchPointerEvent(svg, 'pointermove', 160, 170, 1);
    fixture.detectChanges();

    expect(panLayer.getAttribute('transform')).toBe('translate(60,50) scale(1)');
    expect(root.querySelector('.cursor-grabbing')).not.toBeNull();

    dispatchPointerEvent(svg, 'pointerup', 160, 170, 1);
    dispatchPointerEvent(svg, 'pointermove', 200, 210, 1);
    fixture.detectChanges();

    expect(panLayer.getAttribute('transform')).toBe('translate(60,50) scale(1)');
    expect(root.querySelector('.cursor-grab')).not.toBeNull();
  });

  it('pan reducer starts, moves, and stops dragging', () => {
    const started = startPan(initialPanState(), { pointerId: 4, clientX: 10, clientY: 20 });
    expect(started.dragging).toBe(true);
    expect(started.translationX).toBe(0);
    expect(started.translationY).toBe(0);

    const moved = movePan(started, { pointerId: 4, clientX: 35, clientY: 50 });
    expect(moved.translationX).toBe(25);
    expect(moved.translationY).toBe(30);

    const ended = endPan(moved, { pointerId: 4, clientX: 35, clientY: 50 });
    expect(ended.dragging).toBe(false);

    const ignoredMove = movePan(ended, { pointerId: 4, clientX: 60, clientY: 90 });
    expect(ignoredMove.translationX).toBe(25);
    expect(ignoredMove.translationY).toBe(30);
  });

  it('zoom reducer clamps zoom and keeps focus point stable', () => {
    const state = initialPanState();
    const focusX = 240;
    const focusY = 180;

    const zoomedIn = zoomPan(state, { deltaY: -120, focusX, focusY });
    expect(zoomedIn.zoom).toBeGreaterThan(1);

    const worldXBefore = (focusX - state.translationX) / state.zoom;
    const worldYBefore = (focusY - state.translationY) / state.zoom;
    const worldXAfter = (focusX - zoomedIn.translationX) / zoomedIn.zoom;
    const worldYAfter = (focusY - zoomedIn.translationY) / zoomedIn.zoom;
    expect(worldXAfter).toBeCloseTo(worldXBefore, 8);
    expect(worldYAfter).toBeCloseTo(worldYBefore, 8);

    const atMax = { ...zoomedIn, zoom: ZOOM_MAX };
    const maxClamped = zoomPan(atMax, { deltaY: -120, focusX, focusY });
    expect(maxClamped.zoom).toBe(ZOOM_MAX);

    const atMin = { ...zoomedIn, zoom: ZOOM_MIN };
    const minClamped = zoomPan(atMin, { deltaY: 120, focusX, focusY });
    expect(minClamped.zoom).toBe(ZOOM_MIN);
  });

  it('updates transform on mouse wheel zoom', () => {
    TestBed.configureTestingModule({
      imports: [TimelineGraphComponent]
    });

    const fixture = TestBed.createComponent(TimelineGraphComponent);
    fixture.componentRef.setInput('graphDto', graphDtoFixture);
    fixture.componentRef.setInput('renderModel', renderModelFixture);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const svg = root.querySelector('[data-testid="timeline-graph-svg"]') as SVGElement;
    const panLayer = root.querySelector('[data-testid="timeline-pan-layer"]') as SVGGElement;
    expect(panLayer.getAttribute('transform')).toBe('translate(0,0) scale(1)');

    dispatchWheelEvent(svg, -120, 260, 180);
    fixture.detectChanges();

    const transformAfterZoomIn = panLayer.getAttribute('transform') ?? '';
    expect(transformAfterZoomIn).toContain('scale(');
    expect(transformAfterZoomIn).not.toBe('translate(0,0) scale(1)');
  });
});

const dispatchPointerEvent = (
  element: Element,
  type: string,
  clientX: number,
  clientY: number,
  pointerId: number
): void => {
  const event = new Event(type, { bubbles: true, cancelable: true }) as PointerEvent;
  Object.defineProperty(event, 'clientX', { value: clientX });
  Object.defineProperty(event, 'clientY', { value: clientY });
  Object.defineProperty(event, 'pointerId', { value: pointerId });
  element.dispatchEvent(event);
};

const dispatchWheelEvent = (element: Element, deltaY: number, clientX: number, clientY: number): void => {
  const event = new Event('wheel', { bubbles: true, cancelable: true }) as WheelEvent;
  Object.defineProperty(event, 'deltaY', { value: deltaY });
  Object.defineProperty(event, 'clientX', { value: clientX });
  Object.defineProperty(event, 'clientY', { value: clientY });
  element.dispatchEvent(event);
};
