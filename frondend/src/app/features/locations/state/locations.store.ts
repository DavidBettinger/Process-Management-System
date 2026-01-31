import { computed, Injectable, signal } from '@angular/core';
import { Observable, defer, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
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

  loadLocations(): Observable<void> {
    return defer(() => {
      this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
      return this.locationsApi.listLocations().pipe(
        tap((response) => {
          this.state.update((current) => ({
            ...current,
            status: 'success',
            items: response.items
          }));
        }),
        map(() => void 0),
        catchError((error) => {
          this.state.update((current) => ({ ...current, status: 'error', error: toStoreError(error) }));
          return of(void 0);
        })
      );
    });
  }

  createLocation(request: CreateLocationRequest): Observable<void> {
    return defer(() => {
      this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
      return this.locationsApi.createLocation(request).pipe(
        switchMap(() => this.loadLocations()),
        catchError((error) => {
          this.state.update((current) => ({ ...current, status: 'error', error: toStoreError(error) }));
          return of(void 0);
        })
      );
    });
  }
}
