import { computed, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LocationsApi } from '../../../core/api/locations.api';
import { CreateLocationRequest, Location } from '../../../core/models/location.model';
import { initialListState, ListState, toStoreError } from '../../../core/state/state.types';

@Injectable({ providedIn: 'root' })
export class LocationsStore {
  readonly state = signal<ListState<Location>>(initialListState());

  readonly locations = computed(() => this.state().items);
  readonly status = computed(() => this.state().status);
  readonly error = computed(() => this.state().error);
  readonly isLoading = computed(() => this.state().status === 'loading');
  readonly isEmpty = computed(() => this.state().status === 'success' && this.state().items.length === 0);

  constructor(private readonly locationsApi: LocationsApi) {}

  async loadLocations(): Promise<void> {
    this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
    try {
      const response = await firstValueFrom(this.locationsApi.listLocations());
      this.state.update((current) => ({
        ...current,
        status: 'success',
        items: response.items
      }));
    } catch (error) {
      this.state.update((current) => ({ ...current, status: 'error', error: toStoreError(error) }));
    }
  }

  async createLocation(request: CreateLocationRequest): Promise<void> {
    this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
    try {
      await firstValueFrom(this.locationsApi.createLocation(request));
      await this.loadLocations();
    } catch (error) {
      this.state.update((current) => ({ ...current, status: 'error', error: toStoreError(error) }));
    }
  }
}
