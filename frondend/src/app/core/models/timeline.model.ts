export type TimelineEntryType = 'MEETING_HELD' | 'TASK_CREATED' | 'TASK_ASSIGNED' | 'TASK_RESOLVED';

export interface TimelineEntry {
  type: TimelineEntryType;
  occurredAt: string;
  meetingId?: string | null;
  taskId?: string | null;
  assigneeId?: string | null;
}

export interface TimelineResponse {
  caseId: string;
  entries: TimelineEntry[];
}

export type CaseTimeline = TimelineResponse;
