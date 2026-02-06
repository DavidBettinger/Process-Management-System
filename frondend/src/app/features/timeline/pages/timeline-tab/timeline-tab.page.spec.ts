import { TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { TimelineTabPageComponent } from './timeline-tab.page';
import { TimelineGraphStore } from '../../state/timeline-graph.store';
import {
  TimelineGraphNodeType,
  TimelineGraphRenderModel,
  TimelineGraphResponse
} from '../../../../core/models/timeline-graph.model';
import { LoadStatus, StoreError } from '../../../../core/state/state.types';
import { TimelineGraphSelectionDetails } from '../../state/timeline-graph.store';

class TimelineGraphStoreStub {
  status = signal<LoadStatus>('idle');
  graphDto = signal<TimelineGraphResponse | null>(null);
  renderModel = signal<TimelineGraphRenderModel>({ nodes: [], edges: [] });
  error = signal<StoreError | undefined>(undefined);
  selectedNodeId = signal<string | null>(null);
  selectedNodeType = signal<TimelineGraphNodeType | null>(null);
  selectedDetails = signal<TimelineGraphSelectionDetails | null>(null);
  isLoading = computed(() => this.status() === 'loading');

  setCaseIdCalls: string[] = [];
  loadTimelineGraphCalls = 0;
  selectNodeCalls: Array<{ nodeId: string; nodeType: TimelineGraphNodeType }> = [];
  clearSelectionCalls = 0;

  setCaseId = (caseId: string) => {
    this.setCaseIdCalls.push(caseId);
  };

  loadTimelineGraph = () => {
    this.loadTimelineGraphCalls += 1;
    return of(void 0);
  };

  selectNode = (nodeId: string, nodeType: TimelineGraphNodeType) => {
    this.selectNodeCalls.push({ nodeId, nodeType });
    this.selectedNodeId.set(nodeId);
    this.selectedNodeType.set(nodeType);
    if (nodeType === 'meeting') {
      this.selectedDetails.set({
        type: 'meeting',
        nodeId,
        title: 'Kickoff',
        dateLabel: '20.02.2026 11:06',
        locationLabel: 'Kita Langballig',
        participantLabels: ['Anna L. — Beratung']
      });
    } else if (nodeType === 'task') {
      this.selectedDetails.set({
        type: 'task',
        nodeId,
        title: 'Konzeptentwurf vorbereiten',
        statusLabel: 'Offen',
        priorityLabel: 'P2',
        assigneeLabel: 'Anna L. — Beratung'
      });
    } else {
      this.selectedDetails.set({
        type: 'stakeholder',
        nodeId,
        fullName: 'Anna L.',
        roleLabel: 'Beratung',
        relatedMeetingLabel: 'Kickoff (20.02.2026 11:06)'
      });
    }
  };

  clearSelection = () => {
    this.clearSelectionCalls += 1;
    this.selectedNodeId.set(null);
    this.selectedNodeType.set(null);
    this.selectedDetails.set(null);
  };
}

describe('TimelineTabPageComponent', () => {
  it('shows empty state', () => {
    const store = new TimelineGraphStoreStub();
    store.status.set('success');

    TestBed.configureTestingModule({
      imports: [TimelineTabPageComponent],
      providers: [
        { provide: TimelineGraphStore, useValue: store },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ caseId: 'case-1' })) } }
      ]
    });

    const fixture = TestBed.createComponent(TimelineTabPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Noch keine Eintraege vorhanden');
    expect(store.setCaseIdCalls).toEqual(['case-1']);
    expect(store.loadTimelineGraphCalls).toBe(1);
  });

  it('shows error state', () => {
    const store = new TimelineGraphStoreStub();
    store.status.set('error');
    store.error.set({ message: 'Fehler' });

    TestBed.configureTestingModule({
      imports: [TimelineTabPageComponent],
      providers: [
        { provide: TimelineGraphStore, useValue: store },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ caseId: 'case-1' })) } }
      ]
    });

    const fixture = TestBed.createComponent(TimelineTabPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Zeitlinien-Graph konnte nicht geladen werden');
    expect(compiled.textContent).toContain('Fehler');
  });

  it('renders timeline graph component', () => {
    const store = new TimelineGraphStoreStub();
    store.graphDto.set({
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
      stakeholders: [{ id: 'st-1', firstName: 'Anna', lastName: 'L.', role: 'CONSULTANT' }],
      tasks: [{
        id: 'task-1',
        title: 'Konzeptentwurf vorbereiten',
        state: 'OPEN',
        priority: 2,
        assigneeId: 'st-1',
        createdFromMeetingId: 'meeting-1',
        dueDate: '2026-02-28'
      }]
    });
    store.renderModel.set({
      nodes: [{
        id: 'meeting:meeting-1',
        type: 'meeting',
        meetingId: 'meeting-1',
        graphAt: '2026-02-20T11:06:00Z',
        label: 'Kickoff — Kita Langballig'
      }],
      edges: []
    });
    store.status.set('success');

    TestBed.configureTestingModule({
      imports: [TimelineTabPageComponent],
      providers: [
        { provide: TimelineGraphStore, useValue: store },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ caseId: 'case-1' })) } }
      ]
    });

    const fixture = TestBed.createComponent(TimelineTabPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-testid="timeline-graph-svg"]')).not.toBeNull();
    expect(compiled.textContent).toContain('Heute');
  });

  it('selects node on click and shows floating overlay details', () => {
    const store = new TimelineGraphStoreStub();
    store.graphDto.set({
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
      stakeholders: [{ id: 'st-1', firstName: 'Anna', lastName: 'L.', role: 'CONSULTANT' }],
      tasks: [{
        id: 'task-1',
        title: 'Konzeptentwurf vorbereiten',
        state: 'OPEN',
        priority: 2,
        assigneeId: 'st-1',
        createdFromMeetingId: 'meeting-1',
        dueDate: '2026-02-28'
      }]
    });
    store.renderModel.set({
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
          label: 'Anna L. — Beratung'
        }
      ],
      edges: []
    });
    store.status.set('success');

    TestBed.configureTestingModule({
      imports: [TimelineTabPageComponent],
      providers: [
        { provide: TimelineGraphStore, useValue: store },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ caseId: 'case-1' })) } }
      ]
    });

    const fixture = TestBed.createComponent(TimelineTabPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const taskNode = compiled.querySelector(
      '[data-testid="timeline-node-task-meeting:meeting-1:task:task-1"]'
    ) as SVGGElement;
    expect(taskNode).not.toBeNull();

    taskNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(store.selectNodeCalls).toEqual([{ nodeId: 'meeting:meeting-1:task:task-1', nodeType: 'task' }]);
    expect(compiled.querySelector('[data-testid="timeline-floating-overlay-task"]')).not.toBeNull();
    expect(compiled.textContent).toContain('Konzeptentwurf vorbereiten');
    expect(compiled.textContent).toContain('P2');
    expect(compiled.textContent).toContain('Anna L. — Beratung');
  });

  it('closes floating overlay on escape key', () => {
    const store = new TimelineGraphStoreStub();
    store.graphDto.set({
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
      stakeholders: [{ id: 'st-1', firstName: 'Anna', lastName: 'L.', role: 'CONSULTANT' }],
      tasks: [{
        id: 'task-1',
        title: 'Konzeptentwurf vorbereiten',
        state: 'OPEN',
        priority: 2,
        assigneeId: 'st-1',
        createdFromMeetingId: 'meeting-1',
        dueDate: '2026-02-28'
      }]
    });
    store.renderModel.set({
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
        }
      ],
      edges: []
    });
    store.status.set('success');

    TestBed.configureTestingModule({
      imports: [TimelineTabPageComponent],
      providers: [
        { provide: TimelineGraphStore, useValue: store },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ caseId: 'case-1' })) } }
      ]
    });

    const fixture = TestBed.createComponent(TimelineTabPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const taskNode = compiled.querySelector(
      '[data-testid="timeline-node-task-meeting:meeting-1:task:task-1"]'
    ) as SVGGElement;
    taskNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(compiled.querySelector('[data-testid="timeline-floating-overlay"]')).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(store.clearSelectionCalls).toBe(1);
    expect(compiled.querySelector('[data-testid="timeline-floating-overlay"]')).toBeNull();
  });

  it('closes floating overlay on backdrop click', () => {
    const store = new TimelineGraphStoreStub();
    store.graphDto.set({
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
      stakeholders: [{ id: 'st-1', firstName: 'Anna', lastName: 'L.', role: 'CONSULTANT' }],
      tasks: [{
        id: 'task-1',
        title: 'Konzeptentwurf vorbereiten',
        state: 'OPEN',
        priority: 2,
        assigneeId: 'st-1',
        createdFromMeetingId: 'meeting-1',
        dueDate: '2026-02-28'
      }]
    });
    store.renderModel.set({
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
        }
      ],
      edges: []
    });
    store.status.set('success');

    TestBed.configureTestingModule({
      imports: [TimelineTabPageComponent],
      providers: [
        { provide: TimelineGraphStore, useValue: store },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ caseId: 'case-1' })) } }
      ]
    });

    const fixture = TestBed.createComponent(TimelineTabPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const taskNode = compiled.querySelector(
      '[data-testid="timeline-node-task-meeting:meeting-1:task:task-1"]'
    ) as SVGGElement;
    taskNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    const backdrop = compiled.querySelector('[data-testid="timeline-floating-overlay-backdrop"]') as HTMLDivElement;
    expect(backdrop).not.toBeNull();
    backdrop.click();
    fixture.detectChanges();

    expect(store.clearSelectionCalls).toBe(1);
    expect(compiled.querySelector('[data-testid="timeline-floating-overlay"]')).toBeNull();
  });

  it('remembers dragged overlay position for next open in same app session', () => {
    const store = new TimelineGraphStoreStub();
    store.graphDto.set({
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
      stakeholders: [{ id: 'st-1', firstName: 'Anna', lastName: 'L.', role: 'CONSULTANT' }],
      tasks: [{
        id: 'task-1',
        title: 'Konzeptentwurf vorbereiten',
        state: 'OPEN',
        priority: 2,
        assigneeId: 'st-1',
        createdFromMeetingId: 'meeting-1',
        dueDate: '2026-02-28'
      }]
    });
    store.renderModel.set({
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
        }
      ],
      edges: []
    });
    store.status.set('success');

    TestBed.configureTestingModule({
      imports: [TimelineTabPageComponent],
      providers: [
        { provide: TimelineGraphStore, useValue: store },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ caseId: 'case-1' })) } }
      ]
    });

    const fixture = TestBed.createComponent(TimelineTabPageComponent);
    fixture.detectChanges();

    const page = fixture.componentInstance;
    const compiled = fixture.nativeElement as HTMLElement;
    const taskNode = compiled.querySelector(
      '[data-testid="timeline-node-task-meeting:meeting-1:task:task-1"]'
    ) as SVGGElement;

    taskNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    page.onOverlayPositionChanged({ left: 420, top: 240 });
    page.clearSelection();
    fixture.detectChanges();

    taskNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    const overlay = compiled.querySelector('[data-testid="timeline-floating-overlay"]') as HTMLElement;
    expect(parseInt(overlay.style.left || '0', 10)).toBe(420);
    expect(parseInt(overlay.style.top || '0', 10)).toBe(240);
  });
});
