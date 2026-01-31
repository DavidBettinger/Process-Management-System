import { of, throwError } from 'rxjs';
import { StakeholderDetailStore } from './stakeholder-detail.store';
import { StakeholdersApi } from '../../../core/api/stakeholders.api';

describe('StakeholderDetailStore', () => {
  const createApi = (overrides?: Partial<StakeholdersApi>): StakeholdersApi => {
    return {
      getStakeholders: () => of({
        items: [
          { id: 's-1', firstName: 'Maria', lastName: 'Becker', role: 'CONSULTANT' }
        ],
        page: 0,
        size: 20,
        totalItems: 1,
        totalPages: 1
      }),
      getStakeholderTasks: (_id, page = 0, size = 20) => of({
        stakeholderId: 's-1',
        items: [{
          id: 't-1',
          caseId: 'case-1',
          title: 'Konzept entwerfen',
          state: 'ASSIGNED',
          assigneeId: 's-1',
          dueDate: '2026-02-10'
        }],
        page,
        size,
        totalItems: 1,
        totalPages: 1
      }),
      ...overrides
    } as StakeholdersApi;
  };

  it('loads tasks and updates pagination fields', async () => {
    const store = new StakeholderDetailStore(createApi({
      getStakeholderTasks: (_id, page = 0, size = 10) => of({
        stakeholderId: 's-1',
        items: [],
        page,
        size,
        totalItems: 42,
        totalPages: 5
      })
    }));

    store.setStakeholderId('s-1');
    await store.loadTasks(1, 10, 'dueDate,asc');

    expect(store.tasksStatus()).toBe('success');
    expect(store.page()).toBe(1);
    expect(store.size()).toBe(10);
    expect(store.totalItems()).toBe(42);
    expect(store.totalPages()).toBe(5);
  });

  it('sets error when loadTasks fails', async () => {
    const store = new StakeholderDetailStore(createApi({
      getStakeholderTasks: () => throwError(() => new Error('Fehler'))
    }));

    store.setStakeholderId('s-1');
    await store.loadTasks();

    expect(store.tasksStatus()).toBe('error');
    expect(store.tasksError()?.message).toBe('Fehler');
  });

  it('nextPage increments and reloads when available', async () => {
    let lastPage = 0;
    const store = new StakeholderDetailStore(createApi({
      getStakeholderTasks: (_id, page = 0, size = 10) => {
        lastPage = page;
        return of({
          stakeholderId: 's-1',
          items: [],
          page,
          size,
          totalItems: 30,
          totalPages: 3
        });
      }
    }));

    store.setStakeholderId('s-1');
    await store.loadTasks(0, 10);
    await store.nextPage();

    expect(lastPage).toBe(1);
    expect(store.page()).toBe(1);
  });
});
