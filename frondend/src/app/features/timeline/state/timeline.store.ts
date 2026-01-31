import { computed, Injectable, signal } from '@angular/core';
import { Observable, defer, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AnalyticsApi } from '../../../core/api/analytics.api';
import { CaseTimeline } from '../../../core/models/timeline.model';
import { EntityState, initialEntityState, StoreError, toStoreError } from '../../../core/state/state.types';

@Injectable({ providedIn: 'root' })
export class TimelineStore {
  readonly caseId = signal<string | null>(null);
  readonly state = signal<EntityState<CaseTimeline>>(initialEntityState());

  readonly timeline = computed(() => this.state().data);
  readonly status = computed(() => this.state().status);
  readonly error = computed(() => this.state().error);
  readonly isLoading = computed(() => this.state().status === 'loading');
  readonly isEmpty = computed(() => (this.state().data?.entries.length ?? 0) === 0 && this.state().status === 'success');

  constructor(private readonly analyticsApi: AnalyticsApi) {}

  setCaseId(caseId: string): void {
    this.caseId.set(caseId);
  }

  loadTimeline(): Observable<void> {
    return defer(() => {
      const caseId = this.caseId();
      if (!caseId) {
        this.state.set({ data: null, status: 'error', error: missingCaseIdError() });
        return of(void 0);
      }
      this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
      return this.analyticsApi.getTimeline(caseId).pipe(
        tap((data) => this.state.set({ data, status: 'success', error: undefined })),
        map(() => void 0),
        catchError((error) => {
          this.state.update((current) => ({ ...current, status: 'error', error: toStoreError(error) }));
          return of(void 0);
        })
      );
    });
  }
}

const missingCaseIdError = (): StoreError => ({
  code: 'MISSING_CASE_ID',
  message: 'Prozess-ID fehlt'
});
