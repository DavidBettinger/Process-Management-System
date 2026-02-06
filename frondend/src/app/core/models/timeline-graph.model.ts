import { StakeholderRole } from './stakeholder.model';
import { TaskState } from './task.model';

export type TimelineGraphMeetingStatus = 'PLANNED' | 'PERFORMED';

export interface TimelineGraphMeeting {
  id: string;
  status: TimelineGraphMeetingStatus;
  plannedAt?: string | null;
  performedAt?: string | null;
  title: string;
  locationLabel?: string | null;
  participantStakeholderIds: string[];
}

export interface TimelineGraphStakeholder {
  id: string;
  firstName: string;
  lastName: string;
  role: StakeholderRole;
}

export interface TimelineGraphTask {
  id: string;
  title: string;
  state: TaskState;
  priority: number;
  assigneeId?: string | null;
  createdFromMeetingId?: string | null;
  dueDate?: string | null;
}

export interface TimelineGraphResponse {
  caseId: string;
  generatedAt: string;
  now: string;
  meetings: TimelineGraphMeeting[];
  stakeholders: TimelineGraphStakeholder[];
  tasks: TimelineGraphTask[];
}

export type TimelineGraphNodeType = 'meeting' | 'task' | 'stakeholder';
export type TimelineGraphEdgeType = 'created-from' | 'participation' | 'assignment';

export interface TimelineGraphNodeBase {
  id: string;
  type: TimelineGraphNodeType;
  label: string;
}

export interface TimelineGraphMeetingNode extends TimelineGraphNodeBase {
  type: 'meeting';
  meetingId: string;
  graphAt?: string | null;
}

export interface TimelineGraphTaskNode extends TimelineGraphNodeBase {
  type: 'task';
  taskId: string;
  meetingId?: string | null;
  assigneeId?: string | null;
}

export interface TimelineGraphStakeholderNode extends TimelineGraphNodeBase {
  type: 'stakeholder';
  stakeholderId: string;
  meetingId: string;
}

export type TimelineGraphNode =
  | TimelineGraphMeetingNode
  | TimelineGraphTaskNode
  | TimelineGraphStakeholderNode;

export interface TimelineGraphEdge {
  id: string;
  type: TimelineGraphEdgeType;
  sourceId: string;
  targetId: string;
}

export interface TimelineGraphRenderModel {
  nodes: TimelineGraphNode[];
  edges: TimelineGraphEdge[];
}

export type CaseTimelineGraph = TimelineGraphResponse;
