import { computed, Injectable, signal } from '@angular/core';
import { Observable, defer, of } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';
import { TasksApi } from '../../../core/api/tasks.api';
import {
  AssignTaskRequest,
  BlockTaskRequest,
  CreateTaskRequest,
  DeclineTaskRequest,
  ResolveTaskRequest,
  Task
} from '../../../core/models/task.model';
import { initialListState, ListState, StoreError, toStoreError } from '../../../core/state/state.types';

@Injectable({ providedIn: 'root' })
export class TasksStore {
  readonly caseId = signal<string | null>(null);
  readonly state = signal<ListState<Task>>(initialListState());
  readonly busyTaskIds = signal<Set<string>>(new Set());

  readonly tasks = computed(() => this.state().items);
  readonly status = computed(() => this.state().status);
  readonly error = computed(() => this.state().error);
  readonly isLoading = computed(() => this.state().status === 'loading');

  constructor(private readonly tasksApi: TasksApi) {}

  setCaseId(caseId: string): void {
    this.caseId.set(caseId);
  }

  loadTasks(): Observable<void> {
    return defer(() => {
      const caseId = this.caseId();
      if (!caseId) {
        this.state.update((current) => ({ ...current, status: 'error', error: missingCaseIdError() }));
        return of(void 0);
      }
      this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
      return this.tasksApi.getTasks(caseId).pipe(
        tap((response) => {
          this.state.update(() => ({
            items: response.items,
            status: 'success',
            error: undefined
          }));
        }),
        map(() => void 0),
        catchError((error) => {
          this.state.update((current) => ({
            ...current,
            status: 'error',
            error: toStoreError(error)
          }));
          return of(void 0);
        })
      );
    });
  }

  createTask(req: CreateTaskRequest): Observable<void> {
    return defer(() => {
      const caseId = this.caseId();
      if (!caseId) {
        this.state.update((current) => ({ ...current, status: 'error', error: missingCaseIdError() }));
        return of(void 0);
      }
      this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
      return this.tasksApi.createTask(caseId, req).pipe(
        switchMap(() => this.loadTasks()),
        catchError((error) => {
          this.state.update((current) => ({ ...current, status: 'error', error: toStoreError(error) }));
          return of(void 0);
        })
      );
    });
  }

  assignTask(taskId: string, req: AssignTaskRequest): Observable<void> {
    return this.runTaskAction(taskId, () => this.tasksApi.assignTask(taskId, req));
  }

  startTask(taskId: string): Observable<void> {
    return this.runTaskAction(taskId, () => this.tasksApi.startTask(taskId));
  }

  blockTask(taskId: string, reason: string): Observable<void> {
    const req: BlockTaskRequest = { reason };
    return this.runTaskAction(taskId, () => this.tasksApi.blockTask(taskId, req));
  }

  unblockTask(taskId: string): Observable<void> {
    return this.runTaskAction(taskId, () => this.tasksApi.unblockTask(taskId));
  }

  declineTask(taskId: string, req: DeclineTaskRequest): Observable<void> {
    return this.runTaskAction(taskId, () => this.tasksApi.declineTask(taskId, req));
  }

  resolveTask(taskId: string, req: ResolveTaskRequest): Observable<void> {
    return this.runTaskAction(taskId, () => this.tasksApi.resolveTask(taskId, req));
  }

  isBusy(taskId: string): boolean {
    return this.busyTaskIds().has(taskId);
  }

  private runTaskAction(taskId: string, action: () => Observable<unknown>): Observable<void> {
    return defer(() => {
      this.addBusy(taskId);
      this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
      return action().pipe(
        switchMap(() => this.loadTasks()),
        catchError((error) => {
          this.state.update((current) => ({ ...current, status: 'error', error: toStoreError(error) }));
          return of(void 0);
        }),
        finalize(() => this.removeBusy(taskId))
      );
    });
  }

  private addBusy(taskId: string): void {
    this.busyTaskIds.update((current) => {
      const next = new Set(current);
      next.add(taskId);
      return next;
    });
  }

  private removeBusy(taskId: string): void {
    this.busyTaskIds.update((current) => {
      const next = new Set(current);
      next.delete(taskId);
      return next;
    });
  }
}

const missingCaseIdError = (): StoreError => ({
  code: 'MISSING_CASE_ID',
  message: 'Prozess-ID fehlt'
});
