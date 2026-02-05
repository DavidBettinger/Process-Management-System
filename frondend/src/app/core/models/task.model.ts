export type TaskState = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'BLOCKED' | 'RESOLVED';

export type TaskResolutionKind = 'COMPLETED' | 'NOT_COMPLETED' | 'NOT_APPLICABLE' | 'CANCELLED';

export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  priority: number;
  dueDate?: string | null;
  assigneeId?: string | null;
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

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority: number;
  state: TaskState;
  assigneeId?: string | null;
}

export interface TasksResponse {
  items: Task[];
}

export interface StakeholderTaskSummary {
  id: string;
  caseId: string;
  title: string;
  state: TaskState;
  assigneeId?: string | null;
  dueDate?: string | null;
}

export interface StakeholderTasksResponse {
  stakeholderId: string;
  items: StakeholderTaskSummary[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
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
