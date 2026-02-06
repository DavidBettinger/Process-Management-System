import { TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { TimelineTabPageComponent } from './timeline-tab.page';
import { TimelineGraphStore } from '../../state/timeline-graph.store';
import {
  TimelineGraphRenderModel,
  TimelineGraphResponse
} from '../../../../core/models/timeline-graph.model';
import { LoadStatus, StoreError } from '../../../../core/state/state.types';

class TimelineGraphStoreStub {
  status = signal<LoadStatus>('idle');
  graphDto = signal<TimelineGraphResponse | null>(null);
  renderModel = signal<TimelineGraphRenderModel>({ nodes: [], edges: [] });
  error = signal<StoreError | undefined>(undefined);
  isLoading = computed(() => this.status() === 'loading');

  setCaseIdCalls: string[] = [];
  loadTimelineGraphCalls = 0;

  setCaseId = (caseId: string) => {
    this.setCaseIdCalls.push(caseId);
  };

  loadTimelineGraph = () => {
    this.loadTimelineGraphCalls += 1;
    return of(void 0);
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
});
