import { Injectable, signal } from '@angular/core';
import { Observable, defer, of } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';
import { TasksApi } from '../../../core/api/tasks.api';
import {
  CreateTaskReminderRequest,
  TaskReminder
} from '../../../core/models/task-reminder.model';
import { LoadStatus, StoreError, toStoreError } from '../../../core/state/state.types';

export interface TaskRemindersState {
  status: LoadStatus;
  items: TaskReminder[];
  error?: StoreError;
  creating: boolean;
  busyIds: Set<string>;
}

export const initialTaskRemindersState = (): TaskRemindersState => ({
  status: 'idle',
  items: [],
  error: undefined,
  creating: false,
  busyIds: new Set()
});

@Injectable({ providedIn: 'root' })
export class TaskRemindersStore {
  readonly state = signal<Record<string, TaskRemindersState>>({});

  constructor(private readonly tasksApi: TasksApi) {}

  getTaskState(taskId: string): TaskRemindersState {
    return this.state()[taskId] ?? initialTaskRemindersState();
  }

  loadReminders(taskId: string): Observable<void> {
    return defer(() => {
      this.updateTaskState(taskId, (state) => ({ ...state, status: 'loading', error: undefined }));
      return this.tasksApi.listReminders(taskId).pipe(
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

  createReminder(taskId: string, request: CreateTaskReminderRequest): Observable<void> {
    return defer(() => {
      this.updateTaskState(taskId, (state) => ({ ...state, creating: true, error: undefined }));
      return this.tasksApi.createReminder(taskId, request).pipe(
        switchMap(() => this.loadReminders(taskId)),
        catchError((error) => {
          this.updateTaskState(taskId, (state) => ({ ...state, error: toStoreError(error) }));
          return of(void 0);
        }),
        finalize(() => this.updateTaskState(taskId, (state) => ({ ...state, creating: false })))
      );
    });
  }

  deleteReminder(taskId: string, reminderId: string): Observable<void> {
    return defer(() => {
      this.addBusy(taskId, reminderId);
      return this.tasksApi.deleteReminder(taskId, reminderId).pipe(
        switchMap(() => this.loadReminders(taskId)),
        catchError((error) => {
          this.updateTaskState(taskId, (state) => ({ ...state, error: toStoreError(error) }));
          return of(void 0);
        }),
        finalize(() => this.removeBusy(taskId, reminderId))
      );
    });
  }

  isBusy(taskId: string, reminderId: string): boolean {
    return this.getTaskState(taskId).busyIds.has(reminderId);
  }

  private updateTaskState(
    taskId: string,
    updater: (state: TaskRemindersState) => TaskRemindersState
  ): void {
    this.state.update((current) => {
      const currentState = current[taskId] ?? initialTaskRemindersState();
      const nextState = updater(currentState);
      return { ...current, [taskId]: nextState };
    });
  }

  private addBusy(taskId: string, reminderId: string): void {
    this.updateTaskState(taskId, (state) => {
      const nextBusy = new Set(state.busyIds);
      nextBusy.add(reminderId);
      return { ...state, busyIds: nextBusy };
    });
  }

  private removeBusy(taskId: string, reminderId: string): void {
    this.updateTaskState(taskId, (state) => {
      const nextBusy = new Set(state.busyIds);
      nextBusy.delete(reminderId);
      return { ...state, busyIds: nextBusy };
    });
  }
}
