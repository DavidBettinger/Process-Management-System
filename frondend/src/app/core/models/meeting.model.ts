export type MeetingStatus = 'SCHEDULED' | 'HELD' | 'CANCELLED';

export interface ScheduleMeetingRequest {
  scheduledAt: string;
  participantIds: string[];
}

export interface ScheduleMeetingResponse {
  id: string;
  status: MeetingStatus;
}

export interface ActionItemRequest {
  key: string;
  title: string;
  assigneeId?: string | null;
  dueDate?: string | null;
}

export interface HoldMeetingRequest {
  heldAt: string;
  participantIds: string[];
  minutesText: string;
  actionItems?: ActionItemRequest[] | null;
}

export interface HoldMeetingResponse {
  meetingId: string;
  createdTaskIds: string[];
}
