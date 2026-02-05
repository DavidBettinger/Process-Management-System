export interface TaskReminder {
  id: string;
  taskId: string;
  stakeholderId: string;
  remindAt: string;
  note: string | null;
  createdAt: string;
}

export interface CreateTaskReminderRequest {
  stakeholderId: string;
  remindAt: string;
  note?: string | null;
}

export interface CreateTaskReminderResponse {
  id: string;
}

export interface TaskRemindersResponse {
  items: TaskReminder[];
}
