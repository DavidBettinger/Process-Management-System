import { Injectable, signal } from '@angular/core';
import { Observable, defer, of } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';
import { TasksApi } from '../../../core/api/tasks.api';
import { TaskAttachment } from '../../../core/models/task-attachment.model';
import { LoadStatus, StoreError, toStoreError } from '../../../core/state/state.types';

export interface TaskAttachmentsState {
  status: LoadStatus;
  items: TaskAttachment[];
  error?: StoreError;
  uploading: boolean;
  busyIds: Set<string>;
}

export const initialTaskAttachmentsState = (): TaskAttachmentsState => ({
  status: 'idle',
  items: [],
  error: undefined,
  uploading: false,
  busyIds: new Set()
});

@Injectable({ providedIn: 'root' })
export class TaskAttachmentsStore {
  readonly state = signal<Record<string, TaskAttachmentsState>>({});

  constructor(private readonly tasksApi: TasksApi) {}

  getTaskState(taskId: string): TaskAttachmentsState {
    return this.state()[taskId] ?? initialTaskAttachmentsState();
  }

  loadAttachments(taskId: string): Observable<void> {
    return defer(() => {
      this.updateTaskState(taskId, (state) => ({ ...state, status: 'loading', error: undefined }));
      return this.tasksApi.listAttachments(taskId).pipe(
        tap((response) => {
          this.updateTaskState(taskId, (state) => ({
            ...state,
            status: 'success',
            items: response.items,
            error: undefined
          }));
        }),
        map(() => void 0),
        catchError((error) => {
          this.updateTaskState(taskId, (state) => ({
            ...state,
            status: 'error',
            error: toStoreError(error)
          }));
          return of(void 0);
        })
      );
    });
  }

  uploadAttachment(taskId: string, file: File): Observable<void> {
    return defer(() => {
      this.updateTaskState(taskId, (state) => ({ ...state, uploading: true, error: undefined }));
      return this.tasksApi.uploadAttachment(taskId, file).pipe(
        switchMap(() => this.loadAttachments(taskId)),
        catchError((error) => {
          this.updateTaskState(taskId, (state) => ({ ...state, error: toStoreError(error) }));
          return of(void 0);
        }),
        finalize(() => this.updateTaskState(taskId, (state) => ({ ...state, uploading: false })))
      );
    });
  }

  deleteAttachment(taskId: string, attachmentId: string): Observable<void> {
    return defer(() => {
      this.addBusy(taskId, attachmentId);
      return this.tasksApi.deleteAttachment(taskId, attachmentId).pipe(
        switchMap(() => this.loadAttachments(taskId)),
        catchError((error) => {
          this.updateTaskState(taskId, (state) => ({ ...state, error: toStoreError(error) }));
          return of(void 0);
        }),
        finalize(() => this.removeBusy(taskId, attachmentId))
      );
    });
  }

  downloadAttachment(taskId: string, attachmentId: string): Observable<Blob> {
    return this.tasksApi.downloadAttachment(taskId, attachmentId);
  }

  isBusy(taskId: string, attachmentId: string): boolean {
    return this.getTaskState(taskId).busyIds.has(attachmentId);
  }

  private updateTaskState(
    taskId: string,
    updater: (state: TaskAttachmentsState) => TaskAttachmentsState
  ): void {
    this.state.update((current) => {
      const currentState = current[taskId] ?? initialTaskAttachmentsState();
      const nextState = updater(currentState);
      return { ...current, [taskId]: nextState };
    });
  }

  private addBusy(taskId: string, attachmentId: string): void {
    this.updateTaskState(taskId, (state) => {
      const nextBusy = new Set(state.busyIds);
      nextBusy.add(attachmentId);
      return { ...state, busyIds: nextBusy };
    });
  }

  private removeBusy(taskId: string, attachmentId: string): void {
    this.updateTaskState(taskId, (state) => {
      const nextBusy = new Set(state.busyIds);
      nextBusy.delete(attachmentId);
      return { ...state, busyIds: nextBusy };
    });
  }
}
