import { computed, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CasesApi } from '../../../core/api/cases.api';
import { CreateCaseRequest, ProcessCase } from '../../../core/models/case.model';
import { initialListState, ListState, toStoreError } from '../../../core/state/state.types';

@Injectable({ providedIn: 'root' })
export class CasesStore {
  readonly state = signal<ListState<ProcessCase>>(initialListState());

  readonly cases = computed(() => this.state().items);
  readonly status = computed(() => this.state().status);
  readonly error = computed(() => this.state().error);
  readonly isLoading = computed(() => this.state().status === 'loading');
  readonly isEmpty = computed(() => this.state().status === 'success' && this.state().items.length === 0);

  constructor(private readonly casesApi: CasesApi) {}

  async loadCases(): Promise<void> {
    // TODO: Implement GET /api/cases when backend supports listing cases.
    this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
    const error = toStoreError({ message: 'TODO: /api/cases Liste fehlt' });
    this.state.update((current) => ({
      ...current,
      status: 'error',
      error
    }));
  }

  async createCase(request: CreateCaseRequest): Promise<void> {
    this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
    try {
      await firstValueFrom(this.casesApi.createCase(request));
      await this.loadCases();
    } catch (error) {
      this.state.update((current) => ({
        ...current,
        status: 'error',
        error: toStoreError(error)
      }));
    }
  }
}
