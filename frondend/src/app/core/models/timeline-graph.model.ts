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

export type CaseTimelineGraph = TimelineGraphResponse;
