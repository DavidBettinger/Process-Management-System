import { computed, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { StakeholdersApi } from '../../../core/api/stakeholders.api';
import {
  CreateStakeholderRequest,
  Stakeholder,
  StakeholdersListResponse
} from '../../../core/models/stakeholder.model';
import { initialListState, ListState, toStoreError } from '../../../core/state/state.types';

@Injectable({ providedIn: 'root' })
export class StakeholdersStore {
  readonly state = signal<ListState<Stakeholder>>(initialListState());

  readonly stakeholders = computed(() => this.state().items);
  readonly status = computed(() => this.state().status);
  readonly error = computed(() => this.state().error);
  readonly isLoading = computed(() => this.state().status === 'loading');
  readonly isEmpty = computed(() => this.state().status === 'success' && this.state().items.length === 0);

  constructor(private readonly stakeholdersApi: StakeholdersApi) {}

  async loadStakeholders(): Promise<void> {
    this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
    try {
      const response: StakeholdersListResponse = await firstValueFrom(this.stakeholdersApi.listStakeholders());
      this.state.update((current) => ({
        ...current,
        status: 'success',
        items: response.items
      }));
    } catch (error) {
      this.state.update((current) => ({ ...current, status: 'error', error: toStoreError(error) }));
    }
  }

  async createStakeholder(request: CreateStakeholderRequest): Promise<void> {
    this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
    try {
      await firstValueFrom(this.stakeholdersApi.createStakeholder(request));
      await this.loadStakeholders();
    } catch (error) {
      this.state.update((current) => ({ ...current, status: 'error', error: toStoreError(error) }));
    }
  }
}
