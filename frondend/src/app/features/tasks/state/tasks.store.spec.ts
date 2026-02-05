import { Subject, of, throwError } from 'rxjs';
import { TasksStore } from './tasks.store';
import { TasksApi } from '../../../core/api/tasks.api';
import { CreateTaskRequest, TaskStatusResponse } from '../../../core/models/task.model';

describe('TasksStore', () => {
  const createApi = (overrides?: Partial<TasksApi>): TasksApi => {
    return {
      createTask: () => of({ id: 'task-1', state: 'OPEN' }),
      getTasks: () =>
        of({
          items: [
            { id: 'task-1', title: 'Titel', description: 'Desc', priority: 3, state: 'OPEN', assigneeId: null }
          ]
        }),
      assignTask: () => of({ id: 'task-1', state: 'ASSIGNED', assigneeId: 'u-1' }),
      startTask: () => of({ id: 'task-1', state: 'IN_PROGRESS', assigneeId: 'u-1' }),
      blockTask: () => of({ id: 'task-1', state: 'BLOCKED', assigneeId: 'u-1' }),
      unblockTask: () => of({ id: 'task-1', state: 'IN_PROGRESS', assigneeId: 'u-1' }),
      declineTask: () => of({ id: 'task-1', state: 'OPEN', assigneeId: null }),
      resolveTask: () => of({ id: 'task-1', state: 'RESOLVED', assigneeId: 'u-1' }),
      ...overrides
    } as TasksApi;
  };

  it('marks busy task ids during actions', () => {
    const subject = new Subject<TaskStatusResponse>();
    const store = new TasksStore(createApi({
      assignTask: () => subject.asObservable()
    }));
    store.setCaseId('case-1');

    let completed = false;
    store.assignTask('task-1', { assigneeId: 'u-1' }).subscribe({
      complete: () => {
        completed = true;
      }
    });
    expect(store.isBusy('task-1')).toBe(true);

    subject.next({ id: 'task-1', state: 'ASSIGNED', assigneeId: 'u-1' });
    subject.complete();

    expect(completed).toBe(true);
    expect(store.isBusy('task-1')).toBe(false);
  });

  it('sets error when caseId is missing for createTask', () => {
    const store = new TasksStore(createApi());

    store
      .createTask({ title: 'Titel', description: 'Desc', priority: 3, dueDate: null, assigneeId: null })
      .subscribe();

    expect(store.status()).toBe('error');
    expect(store.error()?.code).toBe('MISSING_CASE_ID');
  });

  it('forwards priority when creating a task', () => {
    let received: CreateTaskRequest | null = null;
    const store = new TasksStore(createApi({
      createTask: (_caseId, payload) => {
        received = payload;
        return of({ id: 'task-1', state: 'OPEN' });
      }
    }));
    store.setCaseId('case-1');

    store
      .createTask({
        title: 'Titel',
        description: 'Desc',
        priority: 2,
        dueDate: null,
        assigneeId: 'u-9'
      })
      .subscribe();

    expect(received).toEqual({
      title: 'Titel',
      description: 'Desc',
      priority: 2,
      dueDate: null,
      assigneeId: 'u-9'
    });
  });

  it('sets error when caseId is missing for loadTasks', () => {
    const store = new TasksStore(createApi());

    store.loadTasks().subscribe();

    expect(store.status()).toBe('error');
    expect(store.error()?.code).toBe('MISSING_CASE_ID');
  });

  it('sets error on action failure', () => {
    const store = new TasksStore(createApi({
      assignTask: () => throwError(() => new Error('Fehler'))
    }));
    store.setCaseId('case-1');

    store.assignTask('task-1', { assigneeId: 'u-1' }).subscribe();

    expect(store.status()).toBe('error');
    expect(store.error()?.message).toBe('Fehler');
  });

  it('loadTasks stores items on success', () => {
    const store = new TasksStore(createApi());
    store.setCaseId('case-1');

    store.loadTasks().subscribe();

    expect(store.status()).toBe('success');
    expect(store.tasks()).toHaveLength(1);
    expect(store.tasks()[0]?.priority).toBe(3);
    expect(store.tasks()[0]?.description).toBe('Desc');
    expect(store.error()).toBeUndefined();
  });

  it('loadTasks stores error from api', () => {
    const store = new TasksStore(createApi({
      getTasks: () => throwError(() => new Error('Fehler beim Laden'))
    }));
    store.setCaseId('case-1');

    store.loadTasks().subscribe();

    expect(store.status()).toBe('error');
    expect(store.error()?.message).toBe('Fehler beim Laden');
  });
});
