import { computed, Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
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

  loadCases(): Observable<void> {
    this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
    return this.casesApi.getCases().pipe(
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
  }

  createCase(request: CreateCaseRequest): Observable<void> {
    this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
    return this.casesApi.createCase(request).pipe(
      tap((created) => this.lastCreatedId.set(created.id)),
      switchMap(() => this.loadCases()),
      catchError((error) => {
        this.state.update((current) => ({
          ...current,
          status: 'error',
          error: toStoreError(error)
        }));
        return of(void 0);
      })
    );
  }

  clearCreatedId(): void {
    this.lastCreatedId.set(null);
  }
}
