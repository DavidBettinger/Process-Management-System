import { computed, Injectable, signal } from '@angular/core';
import { Observable, defer, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
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

  loadStakeholders(): Observable<void> {
    return defer(() => {
      this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
      return this.stakeholdersApi.getStakeholders(0, 50, 'lastName,asc').pipe(
        tap((response: StakeholdersListResponse) => {
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

  createStakeholder(request: CreateStakeholderRequest): Observable<void> {
    return defer(() => {
      this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
      return this.stakeholdersApi.createStakeholder(request).pipe(
        switchMap(() => this.loadStakeholders()),
        catchError((error) => {
          this.state.update((current) => ({ ...current, status: 'error', error: toStoreError(error) }));
          return of(void 0);
        })
      );
    });
  }
}
