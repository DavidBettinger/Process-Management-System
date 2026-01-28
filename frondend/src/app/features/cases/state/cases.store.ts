import { computed, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CasesApi } from '../../../core/api/cases.api';
import { CreateCaseRequest, ProcessCase } from '../../../core/models/case.model';
import { initialListState, ListState, toStoreError } from '../../../core/state/state.types';

@Injectable({ providedIn: 'root' })
export class CasesStore {
  readonly state = signal<ListState<ProcessCase>>(initialListState());
  readonly lastCreatedId = signal<string | null>(null);

  readonly cases = computed(() => this.state().items);
  readonly status = computed(() => this.state().status);
  readonly error = computed(() => this.state().error);
  readonly isLoading = computed(() => this.state().status === 'loading');
  readonly isEmpty = computed(() => this.state().status === 'success' && this.state().items.length === 0);

  constructor(private readonly casesApi: CasesApi) {}

  async loadCases(): Promise<void> {
    this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
    try {
      const response = await firstValueFrom(this.casesApi.getCases());
      this.state.update(() => ({
        items: response.items,
        status: 'success',
        error: undefined
      }));
    } catch (error) {
      this.state.update((current) => ({
        ...current,
        status: 'error',
        error: toStoreError(error)
      }));
    }
  }

  async createCase(request: CreateCaseRequest): Promise<void> {
    this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
    try {
      const created = await firstValueFrom(this.casesApi.createCase(request));
      this.lastCreatedId.set(created.id);
      await this.loadCases();
    } catch (error) {
      this.state.update((current) => ({
        ...current,
        status: 'error',
        error: toStoreError(error)
      }));
    }
  }

  clearCreatedId(): void {
    this.lastCreatedId.set(null);
  }
}
