import { of, throwError } from 'rxjs';
import { CaseDetailStore } from './case-detail.store';
import { CasesApi } from '../../../core/api/cases.api';
import { ProcessCase } from '../../../core/models/case.model';

describe('CaseDetailStore', () => {
  const createApi = (overrides?: Partial<CasesApi>): CasesApi => {
    let caseData: ProcessCase = {
      id: 'case-1',
      tenantId: 't-1',
      title: 'Titel',
      kitaName: 'Kita',
      status: 'DRAFT',
      stakeholders: [],
      createdAt: '2026-01-01T00:00:00Z'
    };
    return {
      createCase: () => of({ id: 'case-1', status: 'DRAFT' }),
      getCase: () => of(caseData),
      addStakeholder: () => {
        caseData = {
          ...caseData,
          stakeholders: [{ userId: 'u-1', role: 'CONSULTANT' }]
        };
        return of({ caseId: 'case-1', stakeholders: caseData.stakeholders });
      },
      activateCase: () => {
        caseData = { ...caseData, status: 'ACTIVE' };
        return of({ id: 'case-1', status: 'ACTIVE' });
      },
      ...overrides
    } as CasesApi;
  };

  it('loads case details', async () => {
    const store = new CaseDetailStore(createApi());

    store.setCaseId('case-1');
    await store.loadCase();

    expect(store.caseData()?.id).toBe('case-1');
    expect(store.status()).toBe('success');
  });

  it('adds stakeholder and updates state', async () => {
    const store = new CaseDetailStore(createApi());

    store.setCaseId('case-1');
    await store.loadCase();
    await store.addStakeholder({ userId: 'u-1', role: 'CONSULTANT' });

    expect(store.caseData()?.stakeholders.length).toBe(1);
    expect(store.caseData()?.stakeholders[0].userId).toBe('u-1');
  });

  it('activates case and updates status', async () => {
    const store = new CaseDetailStore(createApi());

    store.setCaseId('case-1');
    await store.loadCase();
    await store.activateCase();

    expect(store.caseData()?.status).toBe('ACTIVE');
  });

  it('stores errors', async () => {
    const store = new CaseDetailStore(createApi({
      getCase: () => throwError(() => new Error('Fehler'))
    }));

    store.setCaseId('case-1');
    await store.loadCase();

    expect(store.status()).toBe('error');
    expect(store.error()?.message).toBe('Fehler');
  });

  it('sets error when caseId is missing', async () => {
    const store = new CaseDetailStore(createApi());

    await store.loadCase();

    expect(store.status()).toBe('error');
    expect(store.error()?.code).toBe('MISSING_CASE_ID');
  });
});
