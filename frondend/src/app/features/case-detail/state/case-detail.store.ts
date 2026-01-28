import { computed, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
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

  async loadCase(): Promise<void> {
    const caseId = this.caseId();
    if (!caseId) {
      this.state.set({ data: null, status: 'error', error: missingCaseIdError() });
      return;
    }
    this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
    try {
      const data = await firstValueFrom(this.casesApi.getCase(caseId));
      this.state.set({ data, status: 'success', error: undefined });
    } catch (error) {
      this.state.update((current) => ({
        ...current,
        status: 'error',
        error: toStoreError(error)
      }));
    }
  }

  async addStakeholder(request: AddStakeholderRequest): Promise<void> {
    const caseId = this.caseId();
    if (!caseId) {
      this.state.update((current) => ({ ...current, status: 'error', error: missingCaseIdError() }));
      return;
    }
    this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
    try {
      await firstValueFrom(this.casesApi.addStakeholder(caseId, request));
      await this.loadCase();
    } catch (error) {
      this.state.update((current) => ({ ...current, status: 'error', error: toStoreError(error) }));
    }
  }

  async activateCase(): Promise<void> {
    const caseId = this.caseId();
    if (!caseId) {
      this.state.update((current) => ({ ...current, status: 'error', error: missingCaseIdError() }));
      return;
    }
    this.state.update((current) => ({ ...current, status: 'loading', error: undefined }));
    try {
      await firstValueFrom(this.casesApi.activateCase(caseId));
      await this.loadCase();
    } catch (error) {
      this.state.update((current) => ({ ...current, status: 'error', error: toStoreError(error) }));
    }
  }
}

const missingCaseIdError = (): StoreError => ({
  code: 'MISSING_CASE_ID',
  message: 'CaseId fehlt'
});
