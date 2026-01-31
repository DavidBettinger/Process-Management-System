import { of, throwError } from 'rxjs';
import { StakeholdersStore } from './stakeholders.store';
import { StakeholdersApi } from '../../../core/api/stakeholders.api';
import { CreateStakeholderRequest, StakeholdersListResponse } from '../../../core/models/stakeholder.model';

describe('StakeholdersStore', () => {
  const createApi = (overrides?: Partial<StakeholdersApi>): StakeholdersApi => {
    const response: StakeholdersListResponse = {
      items: [
        {
          id: 's-1',
          firstName: 'Maria',
          lastName: 'Becker',
          role: 'CONSULTANT'
        }
      ],
      page: 0,
      size: 20,
      totalItems: 1,
      totalPages: 1
    };
    return {
      getStakeholders: () => of(response),
      createStakeholder: () => of({ id: 's-1' }),
      ...overrides
    } as StakeholdersApi;
  };

  it('loads stakeholders into state', async () => {
    const store = new StakeholdersStore(createApi());

    await store.loadStakeholders();

    expect(store.status()).toBe('success');
    expect(store.stakeholders()).toHaveLength(1);
  });

  it('stores errors when load fails', async () => {
    const store = new StakeholdersStore(createApi({
      getStakeholders: () => throwError(() => new Error('Fehler'))
    }));

    await store.loadStakeholders();

    expect(store.status()).toBe('error');
    expect(store.error()?.message).toBe('Fehler');
  });

  it('creates a stakeholder and refreshes list', async () => {
    const store = new StakeholdersStore(createApi());
    const request: CreateStakeholderRequest = {
      firstName: 'Maria',
      lastName: 'Becker',
      role: 'CONSULTANT'
    };

    await store.createStakeholder(request);

    expect(store.status()).toBe('success');
    expect(store.stakeholders()).toHaveLength(1);
  });

  it('stores errors when create fails', async () => {
    const store = new StakeholdersStore(createApi({
      createStakeholder: () => throwError(() => new Error('Fehler beim Speichern'))
    }));

    await store.createStakeholder({
      firstName: 'Maria',
      lastName: 'Becker',
      role: 'CONSULTANT'
    });

    expect(store.status()).toBe('error');
    expect(store.error()?.message).toBe('Fehler beim Speichern');
  });
});
