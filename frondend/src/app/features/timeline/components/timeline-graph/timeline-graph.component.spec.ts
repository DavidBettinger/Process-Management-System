import { TestBed } from '@angular/core/testing';
import {
  TimelineGraphRenderModel,
  TimelineGraphResponse
} from '../../../../core/models/timeline-graph.model';
import {
  buildTimelineGraphLayout,
  endPan,
  getMeetingNodeClasses,
  getTaskNodeClasses,
  GRAPH_RIGHT_PADDING_PX,
  initialPanState,
  isTaskOverdue,
  movePan,
  stackNodesByCollision,
  startPan,
  STAKEHOLDER_LANE_GAP,
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

  it('renders stakeholder role labels in German', () => {
    TestBed.configureTestingModule({
      imports: [TimelineGraphComponent]
    });

    const fixture = TestBed.createComponent(TimelineGraphComponent);
    fixture.componentRef.setInput('graphDto', graphDtoFixture);
    fixture.componentRef.setInput('renderModel', renderModelFixture);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Anna L. — Beratung');
    expect(compiled.textContent).not.toContain('Anna L. — CONSULTANT');
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

  it('emits selected node and applies selected styling', () => {
    TestBed.configureTestingModule({
      imports: [TimelineGraphComponent]
    });

    const fixture = TestBed.createComponent(TimelineGraphComponent);
    fixture.componentRef.setInput('graphDto', graphDtoFixture);
    fixture.componentRef.setInput('renderModel', renderModelFixture);
    fixture.componentRef.setInput('selectedNodeId', 'meeting:meeting-1:task:task-1');
    fixture.componentRef.setInput('selectedNodeType', 'task');
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const selectedEvents: Array<{ nodeId: string; nodeType: string }> = [];
    component.nodeSelected.subscribe((event) => selectedEvents.push(event));

    const root = fixture.nativeElement as HTMLElement;
    const taskNode = root.querySelector(
      '[data-testid="timeline-node-task-meeting:meeting-1:task:task-1"]'
    ) as SVGGElement;
    const taskRect = taskNode.querySelector('rect') as SVGRectElement;
    expect(taskRect.getAttribute('class')).toContain('!stroke-slate-900');

    taskNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(selectedEvents).toEqual([{
      nodeId: 'meeting:meeting-1:task:task-1',
      nodeType: 'task'
    }]);
  });

  it('keeps configured right padding after the right-most graph node', () => {
    const layout = buildTimelineGraphLayout(renderModelFixture, graphDtoFixture);
    const rightMostEdge = Math.max(
      layout.axisEndX,
      ...layout.meetings.map((meeting) => meeting.x + 110),
      ...layout.tasks.map((task) => task.x + task.width),
      ...layout.stakeholders.map((stakeholder) => stakeholder.x + stakeholder.width)
    );

    expect(layout.width - rightMostEdge).toBeGreaterThanOrEqual(GRAPH_RIGHT_PADDING_PX);
  });

  it('expands svg width when meetings extend further to the right', () => {
    TestBed.configureTestingModule({
      imports: [TimelineGraphComponent]
    });

    const fixture = TestBed.createComponent(TimelineGraphComponent);
    fixture.componentRef.setInput('graphDto', graphDtoFixture);
    fixture.componentRef.setInput('renderModel', renderModelFixture);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const initialSvg = root.querySelector('[data-testid="timeline-graph-svg"]') as SVGElement;
    const initialWidth = Number(initialSvg.getAttribute('width'));

    const wideGraphDto: TimelineGraphResponse = {
      ...graphDtoFixture,
      meetings: [
        {
          id: 'meeting-1',
          status: 'PLANNED',
          plannedAt: '2026-02-10T10:00:00Z',
          performedAt: null,
          title: 'Kickoff',
          locationLabel: 'Kita Langballig',
          participantStakeholderIds: []
        },
        {
          id: 'meeting-2',
          status: 'PLANNED',
          plannedAt: '2026-02-17T10:00:00Z',
          performedAt: null,
          title: 'Termin 2',
          locationLabel: 'Kita Langballig',
          participantStakeholderIds: []
        },
        {
          id: 'meeting-3',
          status: 'PLANNED',
          plannedAt: '2026-02-24T10:00:00Z',
          performedAt: null,
          title: 'Termin 3',
          locationLabel: 'Kita Langballig',
          participantStakeholderIds: []
        },
        {
          id: 'meeting-4',
          status: 'PLANNED',
          plannedAt: '2026-03-03T10:00:00Z',
          performedAt: null,
          title: 'Termin 4',
          locationLabel: 'Kita Langballig',
          participantStakeholderIds: []
        }
      ],
      tasks: [],
      stakeholders: []
    };
    const wideRenderModel: TimelineGraphRenderModel = {
      nodes: wideGraphDto.meetings.map((meeting) => ({
        id: `meeting:${meeting.id}`,
        type: 'meeting' as const,
        meetingId: meeting.id,
        graphAt: meeting.plannedAt ?? null,
        label: `${meeting.title} — ${meeting.locationLabel}`
      })),
      edges: []
    };

    fixture.componentRef.setInput('graphDto', wideGraphDto);
    fixture.componentRef.setInput('renderModel', wideRenderModel);
    fixture.detectChanges();

    const expandedSvg = root.querySelector('[data-testid="timeline-graph-svg"]') as SVGElement;
    const expandedWidth = Number(expandedSvg.getAttribute('width'));
    expect(expandedWidth).toBeGreaterThan(initialWidth);
  });

  it('stacks colliding nodes into lower lanes and avoids rectangle intersections', () => {
    const nodes = [
      { id: 'stakeholder-a', x: 100, y: 335, width: 210, height: 46, label: 'A' },
      { id: 'stakeholder-b', x: 120, y: 335, width: 210, height: 46, label: 'B' }
    ];

    const stacked = stackNodesByCollision(nodes, STAKEHOLDER_LANE_GAP);
    const first = stacked.find((node) => node.id === 'stakeholder-a');
    const second = stacked.find((node) => node.id === 'stakeholder-b');

    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect((second as { y: number }).y).toBeGreaterThan((first as { y: number }).y);
    expect((second as { y: number }).y - (first as { y: number }).y).toBeGreaterThanOrEqual(46 + STAKEHOLDER_LANE_GAP);
    expect(hasRectangleIntersections(stacked)).toBe(false);
  });

  it('maps meeting and task states to expected Tailwind class tokens', () => {
    expect(getMeetingNodeClasses('PLANNED').card).toContain('stroke-blue-300');
    expect(getMeetingNodeClasses('PERFORMED').card).toContain('stroke-emerald-300');

    expect(getTaskNodeClasses('OPEN').card).toContain('stroke-slate-300');
    expect(getTaskNodeClasses('ASSIGNED').card).toContain('stroke-blue-300');
    expect(getTaskNodeClasses('IN_PROGRESS').card).toContain('stroke-amber-300');
    expect(getTaskNodeClasses('BLOCKED').card).toContain('stroke-rose-300');
    expect(getTaskNodeClasses('RESOLVED').card).toContain('stroke-emerald-300');
    expect(getTaskNodeClasses('IN_PROGRESS', true).card).toContain('stroke-rose-400');
  });

  it('renders status color classes for fixture nodes', () => {
    TestBed.configureTestingModule({
      imports: [TimelineGraphComponent]
    });

    const fixture = TestBed.createComponent(TimelineGraphComponent);
    fixture.componentRef.setInput('graphDto', graphDtoFixture);
    fixture.componentRef.setInput('renderModel', renderModelFixture);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const taskNode = root.querySelector(
      '[data-testid="timeline-node-task-meeting:meeting-1:task:task-1"]'
    ) as SVGGElement;
    const meetingNode = root.querySelector(
      '[data-testid="timeline-node-meeting-meeting:meeting-1"]'
    ) as SVGGElement;

    const taskRect = taskNode.querySelector('rect') as SVGRectElement;
    const meetingCircle = meetingNode.querySelector('circle') as SVGCircleElement;
    expect(taskRect.getAttribute('class')).toContain('stroke-slate-300');
    expect(meetingCircle.getAttribute('class')).toContain('fill-blue-600');
  });

  it('marks overdue tasks with badge and overdue class', () => {
    TestBed.configureTestingModule({
      imports: [TimelineGraphComponent]
    });

    const fixture = TestBed.createComponent(TimelineGraphComponent);
    const overdueGraphDto: TimelineGraphResponse = {
      ...graphDtoFixture,
      now: '2026-03-01T12:00:00Z',
      tasks: [{
        id: 'task-1',
        title: 'Konzeptentwurf vorbereiten',
        state: 'IN_PROGRESS',
        priority: 2,
        assigneeId: 'st-1',
        createdFromMeetingId: 'meeting-1',
        dueDate: '2026-02-28'
      }]
    };
    const overdueRenderModel: TimelineGraphRenderModel = {
      ...renderModelFixture,
      nodes: renderModelFixture.nodes.map((node) =>
        node.type === 'task'
          ? { ...node, label: 'Konzeptentwurf vorbereiten' }
          : node
      )
    };
    fixture.componentRef.setInput('graphDto', overdueGraphDto);
    fixture.componentRef.setInput('renderModel', overdueRenderModel);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const taskNode = root.querySelector(
      '[data-testid="timeline-node-task-meeting:meeting-1:task:task-1"]'
    ) as SVGGElement;
    const taskRect = taskNode.querySelector('rect') as SVGRectElement;
    expect(taskRect.getAttribute('class')).toContain('stroke-rose-400');
    expect(
      root.querySelector('[data-testid="timeline-task-overdue-meeting:meeting-1:task:task-1"]')
    ).not.toBeNull();
    expect(root.textContent).toContain('Ueberfaellig');
  });

  it('evaluates overdue helper correctly', () => {
    expect(
      isTaskOverdue({ dueDate: '2026-02-05', state: 'IN_PROGRESS' }, '2026-02-06T10:00:00Z')
    ).toBe(true);
    expect(
      isTaskOverdue({ dueDate: '2026-02-05', state: 'RESOLVED' }, '2026-02-06T10:00:00Z')
    ).toBe(false);
    expect(
      isTaskOverdue({ dueDate: null, state: 'IN_PROGRESS' }, '2026-02-06T10:00:00Z')
    ).toBe(false);
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

const hasRectangleIntersections = (
  nodes: Array<{ x: number; y: number; width: number; height: number }>
): boolean => {
  for (let leftIndex = 0; leftIndex < nodes.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < nodes.length; rightIndex += 1) {
      if (rectanglesIntersect(nodes[leftIndex] as { x: number; y: number; width: number; height: number }, nodes[rightIndex] as { x: number; y: number; width: number; height: number })) {
        return true;
      }
    }
  }
  return false;
};

const rectanglesIntersect = (
  left: { x: number; y: number; width: number; height: number },
  right: { x: number; y: number; width: number; height: number }
): boolean =>
  left.x < right.x + right.width
  && left.x + left.width > right.x
  && left.y < right.y + right.height
  && left.y + left.height > right.y;
