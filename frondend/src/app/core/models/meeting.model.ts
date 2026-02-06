export type MeetingStatus = 'SCHEDULED' | 'HELD' | 'CANCELLED';

export interface ScheduleMeetingRequest {
  scheduledAt: string;
  locationId: string;
  participantIds: string[];
  title: string;
  description?: string | null;
}

export interface ScheduleMeetingResponse {
  id: string;
  status: MeetingStatus;
  locationId: string;
  participantIds: string[];
  title: string;
  description?: string | null;
}

export interface Meeting {
  id: string;
  status: MeetingStatus;
  locationId: string;
  participantIds: string[];
  title: string;
  description?: string | null;
  scheduledAt?: string | null;
  heldAt?: string | null;
}

export interface MeetingsResponse {
  items: Meeting[];
}

export interface ActionItemRequest {
  key: string;
  title: string;
  assigneeId?: string | null;
  dueDate?: string | null;
  priority?: number | null;
  description?: string | null;
}

export interface HoldMeetingRequest {
  heldAt: string;
  locationId: string;
  participantIds: string[];
  minutesText: string;
  actionItems?: ActionItemRequest[] | null;
}

export interface HoldMeetingResponse {
  meetingId: string;
  createdTaskIds: string[];
}
