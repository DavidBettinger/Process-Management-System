import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AssignTaskRequest,
  BlockTaskRequest,
  CreateTaskRequest,
  CreateTaskResponse,
  DeclineTaskRequest,
  ResolveTaskRequest,
  TaskStatusResponse,
  TasksResponse
} from '../models/task.model';
import {
  TaskAttachmentsResponse,
  UploadAttachmentResponse
} from '../models/task-attachment.model';
import {
  CreateTaskReminderRequest,
  CreateTaskReminderResponse,
  TaskRemindersResponse
} from '../models/task-reminder.model';
import { buildApiUrl } from './api.config';

@Injectable({ providedIn: 'root' })
export class TasksApi {
  constructor(private readonly http: HttpClient) {}

  createTask(caseId: string, request: CreateTaskRequest): Observable<CreateTaskResponse> {
    return this.http.post<CreateTaskResponse>(buildApiUrl(`/cases/${caseId}/tasks`), request);
  }

  getTasks(caseId: string): Observable<TasksResponse> {
    return this.http.get<TasksResponse>(buildApiUrl(`/cases/${caseId}/tasks`));
  }

  assignTask(taskId: string, request: AssignTaskRequest): Observable<TaskStatusResponse> {
    return this.http.post<TaskStatusResponse>(buildApiUrl(`/tasks/${taskId}/assign`), request);
  }

  startTask(taskId: string): Observable<TaskStatusResponse> {
    return this.http.post<TaskStatusResponse>(buildApiUrl(`/tasks/${taskId}/start`), {});
  }

  blockTask(taskId: string, request: BlockTaskRequest): Observable<TaskStatusResponse> {
    return this.http.post<TaskStatusResponse>(buildApiUrl(`/tasks/${taskId}/block`), request);
  }

  unblockTask(taskId: string): Observable<TaskStatusResponse> {
    return this.http.post<TaskStatusResponse>(buildApiUrl(`/tasks/${taskId}/unblock`), {});
  }

  declineTask(taskId: string, request: DeclineTaskRequest): Observable<TaskStatusResponse> {
    return this.http.post<TaskStatusResponse>(buildApiUrl(`/tasks/${taskId}/decline`), request);
  }

  resolveTask(taskId: string, request: ResolveTaskRequest): Observable<TaskStatusResponse> {
    return this.http.post<TaskStatusResponse>(buildApiUrl(`/tasks/${taskId}/resolve`), request);
  }

  uploadAttachment(taskId: string, file: File): Observable<UploadAttachmentResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<UploadAttachmentResponse>(buildApiUrl(`/tasks/${taskId}/attachments`), formData);
  }

  listAttachments(taskId: string): Observable<TaskAttachmentsResponse> {
    return this.http.get<TaskAttachmentsResponse>(buildApiUrl(`/tasks/${taskId}/attachments`));
  }

  downloadAttachment(taskId: string, attachmentId: string): Observable<Blob> {
    return this.http.get(buildApiUrl(`/tasks/${taskId}/attachments/${attachmentId}`), {
      responseType: 'blob'
    });
  }

  deleteAttachment(taskId: string, attachmentId: string): Observable<void> {
    return this.http.delete<void>(buildApiUrl(`/tasks/${taskId}/attachments/${attachmentId}`));
  }

  createReminder(
    taskId: string,
    request: CreateTaskReminderRequest
  ): Observable<CreateTaskReminderResponse> {
    return this.http.post<CreateTaskReminderResponse>(buildApiUrl(`/tasks/${taskId}/reminders`), request);
  }

  listReminders(taskId: string): Observable<TaskRemindersResponse> {
    return this.http.get<TaskRemindersResponse>(buildApiUrl(`/tasks/${taskId}/reminders`));
  }

  deleteReminder(taskId: string, reminderId: string): Observable<void> {
    return this.http.delete<void>(buildApiUrl(`/tasks/${taskId}/reminders/${reminderId}`));
  }
}
