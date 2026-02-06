import { TestBed } from '@angular/core/testing';
import {
  TimelineGraphRenderModel,
  TimelineGraphResponse
} from '../../../../core/models/timeline-graph.model';
import { TimelineGraphComponent } from './timeline-graph.component';

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
});
