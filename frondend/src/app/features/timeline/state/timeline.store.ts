import { computed, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
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

  async loadTimeline(): Promise<void> {
    const caseId = this.caseId();
    if (!caseId) {
      this.state.set({ data: null, status: 'error', error: missingCaseIdError() });
      return;
    }
    this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
    try {
      const data = await firstValueFrom(this.analyticsApi.getTimeline(caseId));
      this.state.set({ data, status: 'success', error: undefined });
    } catch (error) {
      this.state.update((current) => ({ ...current, status: 'error', error: toStoreError(error) }));
    }
  }
}

const missingCaseIdError = (): StoreError => ({
  code: 'MISSING_CASE_ID',
  message: 'Prozess-ID fehlt'
});
