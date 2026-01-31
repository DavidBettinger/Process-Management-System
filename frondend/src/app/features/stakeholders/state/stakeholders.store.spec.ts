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

  it('loads stakeholders into state', () => {
    const store = new StakeholdersStore(createApi());

    store.loadStakeholders().subscribe();

    expect(store.status()).toBe('success');
    expect(store.stakeholders()).toHaveLength(1);
  });

  it('stores errors when load fails', () => {
    const store = new StakeholdersStore(createApi({
      getStakeholders: () => throwError(() => new Error('Fehler'))
    }));

    store.loadStakeholders().subscribe();

    expect(store.status()).toBe('error');
    expect(store.error()?.message).toBe('Fehler');
  });

  it('creates a stakeholder and refreshes list', () => {
    const store = new StakeholdersStore(createApi());
    const request: CreateStakeholderRequest = {
      firstName: 'Maria',
      lastName: 'Becker',
      role: 'CONSULTANT'
    };

    store.createStakeholder(request).subscribe();

    expect(store.status()).toBe('success');
    expect(store.stakeholders()).toHaveLength(1);
  });

  it('stores errors when create fails', () => {
    const store = new StakeholdersStore(createApi({
      createStakeholder: () => throwError(() => new Error('Fehler beim Speichern'))
    }));

    store.createStakeholder({
      firstName: 'Maria',
      lastName: 'Becker',
      role: 'CONSULTANT'
    }).subscribe();

    expect(store.status()).toBe('error');
    expect(store.error()?.message).toBe('Fehler beim Speichern');
  });
});
