export type TaskState = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'BLOCKED' | 'RESOLVED';

export type TaskResolutionKind = 'COMPLETED' | 'NOT_COMPLETED' | 'NOT_APPLICABLE' | 'CANCELLED';

export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  dueDate?: string | null;
}

export interface CreateTaskResponse {
  id: string;
  state: TaskState;
}

export interface TaskStatusResponse {
  id: string;
  state: TaskState;
  assigneeId?: string | null;
}

export interface AssignTaskRequest {
  assigneeId: string;
}

export interface BlockTaskRequest {
  reason: string;
}

export interface DeclineTaskRequest {
  reason: string;
  suggestedAssigneeId?: string | null;
}

export interface ResolveTaskRequest {
  kind: TaskResolutionKind;
  reason: string;
  evidenceRefs?: string[] | null;
}
