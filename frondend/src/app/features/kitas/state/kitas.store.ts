import { computed, Injectable, signal } from '@angular/core';
import { Observable, defer, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { KitasApi } from '../../../core/api/kitas.api';
import { CreateKitaRequest, Kita } from '../../../core/models/kita.model';
import { initialListState, ListState, toStoreError } from '../../../core/state/state.types';

@Injectable({ providedIn: 'root' })
export class KitasStore {
  readonly state = signal<ListState<Kita>>(initialListState());

  readonly kitas = computed(() => this.state().items);
  readonly status = computed(() => this.state().status);
  readonly error = computed(() => this.state().error);
  readonly isLoading = computed(() => this.state().status === 'loading');
  readonly isEmpty = computed(() => this.state().status === 'success' && this.state().items.length === 0);

  constructor(private readonly kitasApi: KitasApi) {}

  loadKitas(): Observable<void> {
    return defer(() => {
      this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
      return this.kitasApi.listKitas().pipe(
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

  createKita(request: CreateKitaRequest): Observable<void> {
    return defer(() => {
      this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
      return this.kitasApi.createKita(request).pipe(
        switchMap(() => this.loadKitas()),
        catchError((error) => {
          this.state.update((current) => ({ ...current, status: 'error', error: toStoreError(error) }));
          return of(void 0);
        })
      );
    });
  }
}
