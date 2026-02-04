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
import { TaskAttachment } from '../models/task-attachment.model';

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
    const payload: CreateTaskRequest = { title: 'Titel', description: 'Desc', priority: 2, dueDate: null };

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
    req.flush({
      items: [
        {
          id: 'task-1',
          title: 'Titel',
          description: 'Desc',
          priority: 2,
          state: 'OPEN',
          assigneeId: null
        }
      ]
    });
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

  it('uploads an attachment', () => {
    const file = new File(['data'], 'bericht.pdf', { type: 'application/pdf' });

    api.uploadAttachment('task-1', file).subscribe();

    const req = httpMock.expectOne('/api/tasks/task-1/attachments');
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    const body = req.request.body as FormData;
    expect(body.get('file')).toBe(file);
    req.flush({ id: 'att-1' });
  });

  it('lists attachments', () => {
    api.listAttachments('task-1').subscribe();

    const req = httpMock.expectOne('/api/tasks/task-1/attachments');
    expect(req.request.method).toBe('GET');
    const items: TaskAttachment[] = [
      {
        id: 'att-1',
        taskId: 'task-1',
        fileName: 'bericht.pdf',
        contentType: 'application/pdf',
        sizeBytes: 1200,
        uploadedAt: '2026-02-01T10:00:00Z',
        uploadedByStakeholderId: 's-1'
      }
    ];
    req.flush({ items });
  });

  it('downloads an attachment', () => {
    api.downloadAttachment('task-1', 'att-1').subscribe();

    const req = httpMock.expectOne('/api/tasks/task-1/attachments/att-1');
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['file']));
  });

  it('deletes an attachment', () => {
    api.deleteAttachment('task-1', 'att-1').subscribe();

    const req = httpMock.expectOne('/api/tasks/task-1/attachments/att-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
