import { computed, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { StakeholdersApi } from '../../../core/api/stakeholders.api';
import { Stakeholder, StakeholdersListResponse } from '../../../core/models/stakeholder.model';
import { StakeholderTaskSummary, StakeholderTasksResponse } from '../../../core/models/task.model';
import {
  EntityState,
  initialEntityState,
  LoadStatus,
  StoreError,
  toStoreError
} from '../../../core/state/state.types';

type TasksState = {
  status: LoadStatus;
  items: StakeholderTaskSummary[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  error?: StoreError;
};

const initialTasksState = (): TasksState => ({
  status: 'idle',
  items: [],
  page: 0,
  size: 20,
  totalItems: 0,
  totalPages: 0,
  error: undefined
});

@Injectable({ providedIn: 'root' })
export class StakeholderDetailStore {
  readonly stakeholderId = signal<string | null>(null);
  readonly profileState = signal<EntityState<Stakeholder>>(initialEntityState());
  readonly tasksState = signal<TasksState>(initialTasksState());

  readonly profile = computed(() => this.profileState().data);
  readonly profileStatus = computed(() => this.profileState().status);
  readonly profileError = computed(() => this.profileState().error);
  readonly tasks = computed(() => this.tasksState().items);
  readonly tasksStatus = computed(() => this.tasksState().status);
  readonly tasksError = computed(() => this.tasksState().error);
  readonly page = computed(() => this.tasksState().page);
  readonly size = computed(() => this.tasksState().size);
  readonly totalItems = computed(() => this.tasksState().totalItems);
  readonly totalPages = computed(() => this.tasksState().totalPages);
  readonly hasNext = computed(() => this.page() < Math.max(this.totalPages() - 1, 0));
  readonly hasPrev = computed(() => this.page() > 0);

  constructor(private readonly stakeholdersApi: StakeholdersApi) {}

  setStakeholderId(id: string): void {
    this.stakeholderId.set(id);
    this.profileState.set(initialEntityState());
    this.tasksState.set(initialTasksState());
  }

  async loadProfile(): Promise<void> {
    const stakeholderId = this.stakeholderId();
    if (!stakeholderId) {
      this.profileState.set({ data: null, status: 'error', error: missingStakeholderIdError() });
      return;
    }
    this.profileState.update((current) => ({ ...current, status: 'loading', error: undefined }));
    try {
      // TODO: Replace list lookup with /stakeholders/{id} once backend supports it.
      const response: StakeholdersListResponse = await firstValueFrom(
        this.stakeholdersApi.getStakeholders(0, 100, 'lastName,asc')
      );
      const stakeholder = response.items.find((item) => item.id === stakeholderId);
      if (!stakeholder) {
        this.profileState.set({
          data: null,
          status: 'error',
          error: { code: 'NOT_FOUND', message: 'Beteiligte nicht gefunden' }
        });
        return;
      }
      this.profileState.set({ data: stakeholder, status: 'success', error: undefined });
    } catch (error) {
      this.profileState.update((current) => ({ ...current, status: 'error', error: toStoreError(error) }));
    }
  }

  async loadTasks(page?: number, size?: number, sort?: string): Promise<void> {
    const stakeholderId = this.stakeholderId();
    if (!stakeholderId) {
      this.tasksState.update((current) => ({ ...current, status: 'error', error: missingStakeholderIdError() }));
      return;
    }
    const targetPage = page ?? this.tasksState().page;
    const targetSize = size ?? this.tasksState().size;
    const targetSort = sort ?? 'dueDate,asc';
    this.tasksState.update((current) => ({
      ...current,
      status: 'loading',
      error: undefined,
      page: targetPage,
      size: targetSize
    }));
    try {
      const response: StakeholderTasksResponse = await firstValueFrom(
        this.stakeholdersApi.getStakeholderTasks(stakeholderId, targetPage, targetSize, targetSort)
      );
      this.tasksState.set({
        items: response.items,
        status: 'success',
        error: undefined,
        page: response.page,
        size: response.size,
        totalItems: response.totalItems,
        totalPages: response.totalPages
      });
    } catch (error) {
      this.tasksState.update((current) => ({ ...current, status: 'error', error: toStoreError(error) }));
    }
  }

  async nextPage(): Promise<void> {
    const { page, totalPages, size } = this.tasksState();
    if (page + 1 >= totalPages) {
      return;
    }
    await this.loadTasks(page + 1, size);
  }

  async prevPage(): Promise<void> {
    const { page, size } = this.tasksState();
    if (page <= 0) {
      return;
    }
    await this.loadTasks(page - 1, size);
  }

  async setPageSize(size: number): Promise<void> {
    await this.loadTasks(0, size);
  }
}

const missingStakeholderIdError = (): StoreError => ({
  code: 'MISSING_STAKEHOLDER_ID',
  message: 'Beteiligte-ID fehlt'
});
