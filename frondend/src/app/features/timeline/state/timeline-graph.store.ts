import { computed, Injectable, signal } from '@angular/core';
import { Observable, defer, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AnalyticsApi } from '../../../core/api/analytics.api';
import {
  TimelineGraphEdge,
  TimelineGraphMeeting,
  TimelineGraphMeetingNode,
  TimelineGraphNodeType,
  TimelineGraphRenderModel,
  TimelineGraphResponse,
  TimelineGraphStakeholder,
  TimelineGraphStakeholderNode,
  TimelineGraphTask,
  TimelineGraphTaskNode
} from '../../../core/models/timeline-graph.model';
import { LoadStatus, StoreError, toStoreError } from '../../../core/state/state.types';

interface TimelineGraphStoreState {
  status: LoadStatus;
  graphDto: TimelineGraphResponse | null;
  renderModel: TimelineGraphRenderModel;
  selectedNodeId: string | null;
  selectedNodeType: TimelineGraphNodeType | null;
  error?: StoreError;
}

@Injectable({ providedIn: 'root' })
export class TimelineGraphStore {
  readonly caseId = signal<string | null>(null);
  readonly state = signal<TimelineGraphStoreState>(initialState());

  readonly status = computed(() => this.state().status);
  readonly error = computed(() => this.state().error);
  readonly isLoading = computed(() => this.state().status === 'loading');
  readonly graphDto = computed(() => this.state().graphDto);
  readonly renderModel = computed(() => this.state().renderModel);
  readonly selectedNodeId = computed(() => this.state().selectedNodeId);
  readonly selectedNodeType = computed(() => this.state().selectedNodeType);

  constructor(private readonly analyticsApi: AnalyticsApi) {}

  setCaseId(caseId: string): void {
    this.caseId.set(caseId);
  }

  loadTimelineGraph(): Observable<void> {
    return defer(() => {
      const caseId = this.caseId();
      if (!caseId) {
        this.state.update((current) => ({
          ...current,
          status: 'error',
          error: missingCaseIdError()
        }));
        return of(void 0);
      }
      this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
      return this.analyticsApi.getTimelineGraph(caseId).pipe(
        tap((graphDto) => {
          this.state.set({
            status: 'success',
            graphDto,
            renderModel: mapTimelineGraphToRenderModel(graphDto),
            selectedNodeId: null,
            selectedNodeType: null,
            error: undefined
          });
        }),
        map(() => void 0),
        catchError((error) => {
          this.state.update((current) => ({
            ...current,
            status: 'error',
            error: toStoreError(error)
          }));
          return of(void 0);
        })
      );
    });
  }

  selectNode(nodeId: string, nodeType: TimelineGraphNodeType): void {
    this.state.update((current) => ({ ...current, selectedNodeId: nodeId, selectedNodeType: nodeType }));
  }

  clearSelection(): void {
    this.state.update((current) => ({ ...current, selectedNodeId: null, selectedNodeType: null }));
  }
}

export const mapTimelineGraphToRenderModel = (graphDto: TimelineGraphResponse): TimelineGraphRenderModel => {
  const stakeholdersById = buildStakeholderById(graphDto.stakeholders);
  const meetingIds = new Set(graphDto.meetings.map((meeting) => meeting.id));
  const tasksByMeetingId = groupTasksByMeetingId(graphDto.tasks, meetingIds);

  const meetingNodes: TimelineGraphMeetingNode[] = graphDto.meetings.map((meeting) => ({
    id: toMeetingNodeId(meeting.id),
    type: 'meeting',
    meetingId: meeting.id,
    graphAt: meeting.performedAt ?? meeting.plannedAt ?? null,
    label: buildMeetingLabel(meeting)
  }));

  const taskNodes: TimelineGraphTaskNode[] = graphDto.tasks.map((task) => ({
    id: toTaskNodeId(task.createdFromMeetingId, task.id),
    type: 'task',
    taskId: task.id,
    meetingId: task.createdFromMeetingId ?? null,
    assigneeId: task.assigneeId ?? null,
    label: buildTaskLabel(task)
  }));

  const stakeholderNodes: TimelineGraphStakeholderNode[] = [];
  const participationEdges: TimelineGraphEdge[] = [];
  const assignmentEdges: TimelineGraphEdge[] = [];

  for (const meeting of graphDto.meetings) {
    const stakeholderIds = new Set<string>();
    for (const stakeholderId of meeting.participantStakeholderIds) {
      stakeholderIds.add(stakeholderId);
      participationEdges.push({
        id: `edge:meeting:${meeting.id}:stakeholder:${stakeholderId}:participation`,
        type: 'participation',
        sourceId: toMeetingNodeId(meeting.id),
        targetId: toStakeholderNodeId(meeting.id, stakeholderId)
      });
    }

    for (const task of tasksByMeetingId.get(meeting.id) ?? []) {
      if (task.assigneeId) {
        stakeholderIds.add(task.assigneeId);
        assignmentEdges.push({
          id: `edge:task:${task.id}:stakeholder:${task.assigneeId}:assignment`,
          type: 'assignment',
          sourceId: toTaskNodeId(meeting.id, task.id),
          targetId: toStakeholderNodeId(meeting.id, task.assigneeId)
        });
      }
    }

    for (const stakeholderId of stakeholderIds) {
      stakeholderNodes.push({
        id: toStakeholderNodeId(meeting.id, stakeholderId),
        type: 'stakeholder',
        stakeholderId,
        meetingId: meeting.id,
        label: buildStakeholderLabel(stakeholdersById.get(stakeholderId))
      });
    }
  }

  const createdFromEdges: TimelineGraphEdge[] = graphDto.tasks
    .filter((task) => !!task.createdFromMeetingId && meetingIds.has(task.createdFromMeetingId))
    .map((task) => ({
      id: `edge:meeting:${task.createdFromMeetingId}:task:${task.id}:created-from`,
      type: 'created-from',
      sourceId: toMeetingNodeId(task.createdFromMeetingId as string),
      targetId: toTaskNodeId(task.createdFromMeetingId, task.id)
    }));

  return {
    nodes: [...meetingNodes, ...taskNodes, ...stakeholderNodes],
    edges: [...createdFromEdges, ...participationEdges, ...assignmentEdges]
  };
};

const groupTasksByMeetingId = (
  tasks: TimelineGraphTask[],
  meetingIds: Set<string>
): Map<string, TimelineGraphTask[]> => {
  const grouped = new Map<string, TimelineGraphTask[]>();
  for (const task of tasks) {
    if (!task.createdFromMeetingId || !meetingIds.has(task.createdFromMeetingId)) {
      continue;
    }
    const existing = grouped.get(task.createdFromMeetingId) ?? [];
    existing.push(task);
    grouped.set(task.createdFromMeetingId, existing);
  }
  return grouped;
};

const buildStakeholderById = (
  stakeholders: TimelineGraphStakeholder[]
): Map<string, TimelineGraphStakeholder> => {
  const map = new Map<string, TimelineGraphStakeholder>();
  for (const stakeholder of stakeholders) {
    map.set(stakeholder.id, stakeholder);
  }
  return map;
};

const buildMeetingLabel = (meeting: TimelineGraphMeeting): string => {
  const title = meeting.title?.trim() || 'Termin';
  const location = meeting.locationLabel?.trim();
  if (location) {
    return `${title} — ${location}`;
  }
  return title;
};

const buildTaskLabel = (task: TimelineGraphTask): string => task.title?.trim() || 'Aufgabe';

const buildStakeholderLabel = (stakeholder?: TimelineGraphStakeholder): string => {
  if (!stakeholder) {
    return 'Unbekannt';
  }
  const fullName = `${stakeholder.firstName} ${stakeholder.lastName}`.trim();
  const nameLabel = fullName || 'Unbekannt';
  return `${nameLabel} — ${stakeholder.role}`;
};

const toMeetingNodeId = (meetingId: string): string => `meeting:${meetingId}`;

const toTaskNodeId = (meetingId: string | null | undefined, taskId: string): string =>
  `meeting:${meetingId ?? 'none'}:task:${taskId}`;

const toStakeholderNodeId = (meetingId: string, stakeholderId: string): string =>
  `meeting:${meetingId}:stakeholder:${stakeholderId}`;

const missingCaseIdError = (): StoreError => ({
  code: 'MISSING_CASE_ID',
  message: 'Prozess-ID fehlt'
});

const initialState = (): TimelineGraphStoreState => ({
  status: 'idle',
  graphDto: null,
  renderModel: { nodes: [], edges: [] },
  selectedNodeId: null,
  selectedNodeType: null,
  error: undefined
});
