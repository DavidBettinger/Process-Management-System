import { of, throwError } from 'rxjs';
import { CasesStore } from './cases.store';
import { CasesApi } from '../../../core/api/cases.api';
import { CreateCaseRequest } from '../../../core/models/case.model';

describe('CasesStore', () => {
  const createApi = (overrides?: Partial<CasesApi>): CasesApi => {
    return {
      createCase: () => of({ id: 'case-1', status: 'DRAFT' }),
      getCase: () => of({
        id: 'case-1',
        tenantId: 't-1',
        title: 'Titel',
        kitaName: 'Kita',
        status: 'DRAFT',
        stakeholders: [],
        createdAt: '2026-01-01T00:00:00Z'
      }),
      addStakeholder: () => of({ caseId: 'case-1', stakeholders: [] }),
      activateCase: () => of({ id: 'case-1', status: 'ACTIVE' }),
      ...overrides
    } as CasesApi;
  };

  it('creates a case and transitions to error due to missing list endpoint', async () => {
    const store = new CasesStore(createApi());
    const request: CreateCaseRequest = { title: 'Titel', kitaName: 'Kita' };

    await store.createCase(request);

    expect(store.status()).toBe('error');
    expect(store.error()?.message).toContain('/api/cases');
  });

  it('stores errors from create case', async () => {
    const store = new CasesStore(createApi({
      createCase: () => throwError(() => new Error('Fehler'))
    }));

    await store.createCase({ title: 'Titel', kitaName: 'Kita' });

    expect(store.status()).toBe('error');
    expect(store.error()?.message).toBe('Fehler');
  });

  it('loadCases sets error when endpoint is missing', async () => {
    const store = new CasesStore(createApi());

    await store.loadCases();

    expect(store.status()).toBe('error');
    expect(store.error()?.message).toContain('/api/cases');
  });
});
