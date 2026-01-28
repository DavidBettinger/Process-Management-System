import { computed, Injectable, signal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
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

  async loadTasks(): Promise<void> {
    // TODO: Implement GET tasks for case once backend provides an endpoint.
    const error = new Error('TODO: Implement GET tasks for case');
    this.state.update((current) => ({
      ...current,
      status: 'error',
      error: toStoreError(error)
    }));
    throw error;
  }

  async createTask(req: CreateTaskRequest): Promise<void> {
    const caseId = this.caseId();
    if (!caseId) {
      this.state.update((current) => ({ ...current, status: 'error', error: missingCaseIdError() }));
      return;
    }
    this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
    try {
      await firstValueFrom(this.tasksApi.createTask(caseId, req));
      await this.loadTasks();
    } catch (error) {
      this.state.update((current) => ({ ...current, status: 'error', error: toStoreError(error) }));
    }
  }

  async assignTask(taskId: string, req: AssignTaskRequest): Promise<void> {
    await this.runTaskAction(taskId, () => this.tasksApi.assignTask(taskId, req));
  }

  async startTask(taskId: string): Promise<void> {
    await this.runTaskAction(taskId, () => this.tasksApi.startTask(taskId));
  }

  async blockTask(taskId: string, reason: string): Promise<void> {
    const req: BlockTaskRequest = { reason };
    await this.runTaskAction(taskId, () => this.tasksApi.blockTask(taskId, req));
  }

  async unblockTask(taskId: string): Promise<void> {
    await this.runTaskAction(taskId, () => this.tasksApi.unblockTask(taskId));
  }

  async declineTask(taskId: string, req: DeclineTaskRequest): Promise<void> {
    await this.runTaskAction(taskId, () => this.tasksApi.declineTask(taskId, req));
  }

  async resolveTask(taskId: string, req: ResolveTaskRequest): Promise<void> {
    await this.runTaskAction(taskId, () => this.tasksApi.resolveTask(taskId, req));
  }

  isBusy(taskId: string): boolean {
    return this.busyTaskIds().has(taskId);
  }

  private async runTaskAction(taskId: string, action: () => Observable<unknown>): Promise<void> {
    this.addBusy(taskId);
    try {
      await firstValueFrom(action());
      await this.loadTasks();
    } catch (error) {
      this.state.update((current) => ({ ...current, status: 'error', error: toStoreError(error) }));
    } finally {
      this.removeBusy(taskId);
    }
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
