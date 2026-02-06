import { of, throwError } from 'rxjs';
import { AnalyticsApi } from '../../../core/api/analytics.api';
import { TimelineGraphResponse } from '../../../core/models/timeline-graph.model';
import { TimelineGraphStore, computeSelectionHighlight, mapTimelineGraphToRenderModel } from './timeline-graph.store';

describe('TimelineGraphStore', () => {
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
      participantStakeholderIds: ['st-1', 'st-2']
    }],
    stakeholders: [
      { id: 'st-1', firstName: 'Anna', lastName: 'L.', role: 'CONSULTANT' },
      { id: 'st-2', firstName: 'Ben', lastName: 'M.', role: 'DIRECTOR' }
    ],
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

  const createApi = (overrides?: Partial<AnalyticsApi>): AnalyticsApi => {
    return {
      getTimeline: () => of({ caseId: 'case-1', entries: [] }),
      getTimelineGraph: () => of(graphDtoFixture),
      ...overrides
    } as AnalyticsApi;
  };

  it('maps meeting, task, and per-meeting stakeholder nodes with expected edges and labels', () => {
    const renderModel = mapTimelineGraphToRenderModel(graphDtoFixture);

    const meetingNodes = renderModel.nodes.filter((node) => node.type === 'meeting');
    const taskNodes = renderModel.nodes.filter((node) => node.type === 'task');
    const stakeholderNodes = renderModel.nodes.filter((node) => node.type === 'stakeholder');

    expect(meetingNodes.length).toBe(1);
    expect(taskNodes.length).toBe(1);
    expect(stakeholderNodes.length).toBe(2);
    expect(taskNodes[0]?.id).toBe('meeting:meeting-1:task:task-1');
    expect(stakeholderNodes[0]?.id).toContain('meeting:meeting-1:stakeholder:');
    expect(stakeholderNodes[1]?.id).toContain('meeting:meeting-1:stakeholder:');

    const createdFromEdges = renderModel.edges.filter((edge) => edge.type === 'created-from');
    const participationEdges = renderModel.edges.filter((edge) => edge.type === 'participation');
    const assignmentEdges = renderModel.edges.filter((edge) => edge.type === 'assignment');
    expect(createdFromEdges.length).toBe(1);
    expect(participationEdges.length).toBe(2);
    expect(assignmentEdges.length).toBe(1);

    const labels = renderModel.nodes.map((node) => node.label);
    expect(labels).toContain('Kickoff — Kita Langballig');
    expect(labels).toContain('Konzeptentwurf vorbereiten');
    expect(labels).toContain('Anna L. — Beratung');
    expect(labels).toContain('Ben M. — Leitung');
    expect(labels.every((label) => !label.includes('meeting-1'))).toBe(true);
    expect(labels.every((label) => !label.includes('task-1'))).toBe(true);
    expect(labels.every((label) => !label.includes('st-1'))).toBe(true);
    expect(labels.every((label) => !label.includes('st-2'))).toBe(true);
  });

  it('loads graph data and manages selection state', () => {
    const store = new TimelineGraphStore(createApi());
    store.setCaseId('case-1');

    store.loadTimelineGraph().subscribe();

    expect(store.status()).toBe('success');
    expect(store.graphDto()?.caseId).toBe('case-1');
    expect(store.renderModel().nodes.length).toBe(4);
    expect(store.renderModel().edges.length).toBe(4);

    store.selectNode('meeting:meeting-1', 'meeting');
    expect(store.selectedNodeId()).toBe('meeting:meeting-1');
    expect(store.selectedNodeType()).toBe('meeting');
    expect(store.selectedDetails()).toEqual({
      type: 'meeting',
      nodeId: 'meeting:meeting-1',
      title: 'Kickoff',
      dateLabel: '20.02.2026 11:06',
      locationLabel: 'Kita Langballig',
      participantLabels: ['Anna L. — Beratung', 'Ben M. — Leitung']
    });

    store.selectNode('meeting:meeting-1:task:task-1', 'task');
    expect(store.selectedDetails()).toEqual({
      type: 'task',
      nodeId: 'meeting:meeting-1:task:task-1',
      title: 'Konzeptentwurf vorbereiten',
      statusLabel: 'Offen',
      priorityLabel: 'P2',
      assigneeLabel: 'Anna L. — Beratung'
    });

    store.selectNode('meeting:meeting-1:stakeholder:st-2', 'stakeholder');
    expect(store.selectedDetails()).toEqual({
      type: 'stakeholder',
      nodeId: 'meeting:meeting-1:stakeholder:st-2',
      fullName: 'Ben M.',
      roleLabel: 'Leitung',
      relatedMeetingLabel: 'Kickoff (20.02.2026 11:06)'
    });

    store.clearSelection();
    expect(store.selectedNodeId()).toBeNull();
    expect(store.selectedNodeType()).toBeNull();
    expect(store.selectedDetails()).toBeNull();
  });

  it('sets missing-case-id and api errors', () => {
    const missingCaseIdStore = new TimelineGraphStore(createApi());
    missingCaseIdStore.loadTimelineGraph().subscribe();
    expect(missingCaseIdStore.status()).toBe('error');
    expect(missingCaseIdStore.error()?.code).toBe('MISSING_CASE_ID');

    const failedStore = new TimelineGraphStore(createApi({
      getTimelineGraph: () => throwError(() => new Error('Fehler'))
    }));
    failedStore.setCaseId('case-1');
    failedStore.loadTimelineGraph().subscribe();
    expect(failedStore.status()).toBe('error');
    expect(failedStore.error()?.message).toBe('Fehler');
  });

  it('highlights meeting selection with connected tasks, stakeholders, and edges', () => {
    const renderModel = mapTimelineGraphToRenderModel(graphDtoFixture);
    const highlight = computeSelectionHighlight(renderModel, 'meeting:meeting-1');

    expect(new Set(highlight.highlightedNodeIds)).toEqual(
      new Set([
        'meeting:meeting-1',
        'meeting:meeting-1:task:task-1',
        'meeting:meeting-1:stakeholder:st-1',
        'meeting:meeting-1:stakeholder:st-2'
      ])
    );
    expect(new Set(highlight.highlightedEdgeIds)).toEqual(
      new Set([
        'edge:meeting:meeting-1:task:task-1:created-from',
        'edge:meeting:meeting-1:stakeholder:st-1:participation',
        'edge:meeting:meeting-1:stakeholder:st-2:participation'
      ])
    );
    expect(highlight.contextMeetingId).toBe('meeting-1');
  });

  it('highlights task selection with its meeting and direct edges', () => {
    const renderModel = mapTimelineGraphToRenderModel(graphDtoFixture);
    const highlight = computeSelectionHighlight(renderModel, 'meeting:meeting-1:task:task-1');

    expect(new Set(highlight.highlightedNodeIds)).toEqual(
      new Set([
        'meeting:meeting-1:task:task-1',
        'meeting:meeting-1',
        'meeting:meeting-1:stakeholder:st-1'
      ])
    );
    expect(new Set(highlight.highlightedEdgeIds)).toEqual(
      new Set([
        'edge:meeting:meeting-1:task:task-1:created-from',
        'edge:task:task-1:stakeholder:st-1:assignment'
      ])
    );
    expect(highlight.contextMeetingId).toBe('meeting-1');
  });

  it('highlights stakeholder selection with its meeting and direct edges', () => {
    const renderModel = mapTimelineGraphToRenderModel(graphDtoFixture);
    const highlight = computeSelectionHighlight(renderModel, 'meeting:meeting-1:stakeholder:st-1');

    expect(new Set(highlight.highlightedNodeIds)).toEqual(
      new Set([
        'meeting:meeting-1:stakeholder:st-1',
        'meeting:meeting-1',
        'meeting:meeting-1:task:task-1'
      ])
    );
    expect(new Set(highlight.highlightedEdgeIds)).toEqual(
      new Set([
        'edge:meeting:meeting-1:stakeholder:st-1:participation',
        'edge:task:task-1:stakeholder:st-1:assignment'
      ])
    );
    expect(highlight.contextMeetingId).toBe('meeting-1');
  });
});
