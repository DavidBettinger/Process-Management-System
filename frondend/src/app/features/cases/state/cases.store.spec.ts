import { of, throwError } from 'rxjs';
import { CasesStore } from './cases.store';
import { CasesApi } from '../../../core/api/cases.api';
import { CreateCaseRequest } from '../../../core/models/case.model';

describe('CasesStore', () => {
  const createApi = (overrides?: Partial<CasesApi>): CasesApi => {
    const sampleCase = {
      id: 'case-1',
      tenantId: 't-1',
      title: 'Titel',
      kitaId: 'kita-1',
      status: 'DRAFT',
      stakeholders: [],
      createdAt: '2026-01-01T00:00:00Z'
    };
    return {
      createCase: () => of({ id: 'case-1', status: 'DRAFT' }),
      getCases: () => of({ items: [sampleCase] }),
      getCase: () => of({
        ...sampleCase
      }),
      addStakeholder: () => of({ caseId: 'case-1', stakeholders: [] }),
      activateCase: () => of({ id: 'case-1', status: 'ACTIVE' }),
      ...overrides
    } as CasesApi;
  };

  it('creates a case, records created id, and refreshes list', async () => {
    const store = new CasesStore(createApi());
    const request: CreateCaseRequest = { title: 'Titel', kitaId: 'kita-1' };

    await store.createCase(request);

    expect(store.status()).toBe('success');
    expect(store.cases()).toHaveLength(1);
    expect(store.lastCreatedId()).toBe('case-1');
  });

  it('stores errors from create case', async () => {
    const store = new CasesStore(createApi({
      createCase: () => throwError(() => new Error('Fehler'))
    }));

    await store.createCase({ title: 'Titel', kitaId: 'kita-1' });

    expect(store.status()).toBe('error');
    expect(store.error()?.message).toBe('Fehler');
  });

  it('loadCases stores items on success', async () => {
    const store = new CasesStore(createApi());

    await store.loadCases();

    expect(store.status()).toBe('success');
    expect(store.cases()).toHaveLength(1);
    expect(store.error()).toBeUndefined();
  });

  it('loadCases stores errors from api', async () => {
    const store = new CasesStore(createApi({
      getCases: () => throwError(() => new Error('Fehler beim Laden'))
    }));

    await store.loadCases();

    expect(store.status()).toBe('error');
    expect(store.error()?.message).toBe('Fehler beim Laden');
  });
});
