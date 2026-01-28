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
  TaskStatusResponse
} from '../models/task.model';
import { buildApiUrl } from './api.config';

@Injectable({ providedIn: 'root' })
export class TasksApi {
  constructor(private readonly http: HttpClient) {}

  createTask(caseId: string, request: CreateTaskRequest): Observable<CreateTaskResponse> {
    return this.http.post<CreateTaskResponse>(buildApiUrl(`/cases/${caseId}/tasks`), request);
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
}
