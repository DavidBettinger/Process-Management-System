import { computed, Injectable, signal } from '@angular/core';
import { Observable, defer, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { CasesApi } from '../../../core/api/cases.api';
import { AddStakeholderRequest } from '../../../core/models/stakeholder.model';
import { ProcessCase } from '../../../core/models/case.model';
import { EntityState, initialEntityState, StoreError, toStoreError } from '../../../core/state/state.types';

@Injectable({ providedIn: 'root' })
export class CaseDetailStore {
  readonly caseId = signal<string | null>(null);
  readonly state = signal<EntityState<ProcessCase>>(initialEntityState());

  readonly caseData = computed(() => this.state().data);
  readonly status = computed(() => this.state().status);
  readonly error = computed(() => this.state().error);
  readonly isLoading = computed(() => this.state().status === 'loading');
  readonly stakeholders = computed(() => this.state().data?.stakeholders ?? []);
  readonly caseStatus = computed(() => this.state().data?.status ?? null);
  readonly canActivate = computed(() => {
    const status = this.state().data?.status;
    const hasConsultant = this.state().data?.stakeholders.some(
      (stakeholder) => stakeholder.role === 'CONSULTANT'
    );
    // TODO: Backend does not support PAUSED status yet.
    return status === 'DRAFT' && Boolean(hasConsultant);
  });

  constructor(private readonly casesApi: CasesApi) {}

  setCaseId(caseId: string): void {
    this.caseId.set(caseId);
  }

  loadCase(): Observable<void> {
    return defer(() => {
      const caseId = this.caseId();
      if (!caseId) {
        this.state.set({ data: null, status: 'error', error: missingCaseIdError() });
        return of(void 0);
      }
      this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
      return this.casesApi.getCase(caseId).pipe(
        tap((data) => this.state.set({ data, status: 'success', error: undefined })),
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
    });
  }

  addStakeholder(request: AddStakeholderRequest): Observable<void> {
    return defer(() => {
      const caseId = this.caseId();
      if (!caseId) {
        this.state.update((current) => ({ ...current, status: 'error', error: missingCaseIdError() }));
        return of(void 0);
      }
      this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
      return this.casesApi.addStakeholder(caseId, request).pipe(
        switchMap(() => this.loadCase()),
        catchError((error) => {
          this.state.update((current) => ({ ...current, status: 'error', error: toStoreError(error) }));
          return of(void 0);
        })
      );
    });
  }

  activateCase(): Observable<void> {
    return defer(() => {
      const caseId = this.caseId();
      if (!caseId) {
        this.state.update((current) => ({ ...current, status: 'error', error: missingCaseIdError() }));
        return of(void 0);
      }
      this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
      return this.casesApi.activateCase(caseId).pipe(
        switchMap(() => this.loadCase()),
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
