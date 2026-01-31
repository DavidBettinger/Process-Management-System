import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TasksApi } from './tasks.api';
import {
  AssignTaskRequest,
  BlockTaskRequest,
  CreateTaskRequest,
  DeclineTaskRequest,
  ResolveTaskRequest
} from '../models/task.model';

describe('TasksApi', () => {
  let api: TasksApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    api = TestBed.inject(TasksApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates a task', () => {
    const payload: CreateTaskRequest = { title: 'Titel', description: 'Desc', dueDate: null };

    api.createTask('case-1', payload).subscribe();

    const req = httpMock.expectOne('/api/cases/case-1/tasks');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'task-1', state: 'OPEN' });
  });

  it('gets tasks for a case', () => {
    api.getTasks('case-1').subscribe();

    const req = httpMock.expectOne('/api/cases/case-1/tasks');
    expect(req.request.method).toBe('GET');
    req.flush({ items: [{ id: 'task-1', title: 'Titel', state: 'OPEN', assigneeId: null }] });
  });

  it('assigns a task', () => {
    const payload: AssignTaskRequest = { assigneeId: 'u-1' };

    api.assignTask('task-1', payload).subscribe();

    const req = httpMock.expectOne('/api/tasks/task-1/assign');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'task-1', state: 'ASSIGNED', assigneeId: 'u-1' });
  });

  it('starts a task', () => {
    api.startTask('task-1').subscribe();

    const req = httpMock.expectOne('/api/tasks/task-1/start');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 'task-1', state: 'IN_PROGRESS', assigneeId: 'u-1' });
  });

  it('blocks a task', () => {
    const payload: BlockTaskRequest = { reason: 'Blockiert' };

    api.blockTask('task-1', payload).subscribe();

    const req = httpMock.expectOne('/api/tasks/task-1/block');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'task-1', state: 'BLOCKED', assigneeId: 'u-1' });
  });

  it('unblocks a task', () => {
    api.unblockTask('task-1').subscribe();

    const req = httpMock.expectOne('/api/tasks/task-1/unblock');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 'task-1', state: 'IN_PROGRESS', assigneeId: 'u-1' });
  });

  it('declines a task', () => {
    const payload: DeclineTaskRequest = { reason: 'Nicht zustaendig', suggestedAssigneeId: null };

    api.declineTask('task-1', payload).subscribe();

    const req = httpMock.expectOne('/api/tasks/task-1/decline');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'task-1', state: 'OPEN', assigneeId: null });
  });

  it('resolves a task', () => {
    const payload: ResolveTaskRequest = { kind: 'COMPLETED', reason: 'Fertig', evidenceRefs: [] };

    api.resolveTask('task-1', payload).subscribe();

    const req = httpMock.expectOne('/api/tasks/task-1/resolve');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'task-1', state: 'RESOLVED', assigneeId: 'u-1' });
  });
});
