import { Subject, of, throwError } from 'rxjs';
import { TasksStore } from './tasks.store';
import { TasksApi } from '../../../core/api/tasks.api';
import { TaskStatusResponse } from '../../../core/models/task.model';

describe('TasksStore', () => {
  const createApi = (overrides?: Partial<TasksApi>): TasksApi => {
    return {
      createTask: () => of({ id: 'task-1', state: 'OPEN' }),
      getTasks: () => of({ items: [{ id: 'task-1', state: 'OPEN', assigneeId: null }] }),
      assignTask: () => of({ id: 'task-1', state: 'ASSIGNED', assigneeId: 'u-1' }),
      startTask: () => of({ id: 'task-1', state: 'IN_PROGRESS', assigneeId: 'u-1' }),
      blockTask: () => of({ id: 'task-1', state: 'BLOCKED', assigneeId: 'u-1' }),
      unblockTask: () => of({ id: 'task-1', state: 'IN_PROGRESS', assigneeId: 'u-1' }),
      declineTask: () => of({ id: 'task-1', state: 'OPEN', assigneeId: null }),
      resolveTask: () => of({ id: 'task-1', state: 'RESOLVED', assigneeId: 'u-1' }),
      ...overrides
    } as TasksApi;
  };

  it('marks busy task ids during actions', async () => {
    const subject = new Subject<TaskStatusResponse>();
    const store = new TasksStore(createApi({
      assignTask: () => subject.asObservable()
    }));
    store.setCaseId('case-1');
    (store as { loadTasks: () => Promise<void> }).loadTasks = async () => {};

    const promise = store.assignTask('task-1', { assigneeId: 'u-1' });
    expect(store.isBusy('task-1')).toBe(true);

    subject.next({ id: 'task-1', state: 'ASSIGNED', assigneeId: 'u-1' });
    subject.complete();
    await promise;

    expect(store.isBusy('task-1')).toBe(false);
  });

  it('sets error when caseId is missing for createTask', async () => {
    const store = new TasksStore(createApi());

    await store.createTask({ title: 'Titel', description: 'Desc', dueDate: null });

    expect(store.status()).toBe('error');
    expect(store.error()?.code).toBe('MISSING_CASE_ID');
  });

  it('sets error when caseId is missing for loadTasks', async () => {
    const store = new TasksStore(createApi());

    await store.loadTasks();

    expect(store.status()).toBe('error');
    expect(store.error()?.code).toBe('MISSING_CASE_ID');
  });

  it('sets error on action failure', async () => {
    const store = new TasksStore(createApi({
      assignTask: () => throwError(() => new Error('Fehler'))
    }));
    store.setCaseId('case-1');
    (store as { loadTasks: () => Promise<void> }).loadTasks = async () => {};

    await store.assignTask('task-1', { assigneeId: 'u-1' });

    expect(store.status()).toBe('error');
    expect(store.error()?.message).toBe('Fehler');
  });

  it('loadTasks stores items on success', async () => {
    const store = new TasksStore(createApi());
    store.setCaseId('case-1');

    await store.loadTasks();

    expect(store.status()).toBe('success');
    expect(store.tasks()).toHaveLength(1);
    expect(store.error()).toBeUndefined();
  });

  it('loadTasks stores error from api', async () => {
    const store = new TasksStore(createApi({
      getTasks: () => throwError(() => new Error('Fehler beim Laden'))
    }));
    store.setCaseId('case-1');

    await store.loadTasks();

    expect(store.status()).toBe('error');
    expect(store.error()?.message).toBe('Fehler beim Laden');
  });
});
