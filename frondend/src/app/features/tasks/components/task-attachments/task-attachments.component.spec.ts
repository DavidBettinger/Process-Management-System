import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { TaskAttachmentsComponent } from './task-attachments.component';
import {
  TaskAttachmentsState,
  TaskAttachmentsStore,
  initialTaskAttachmentsState
} from '../../state/task-attachments.store';
import { ConfirmDialogService } from '../../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { ToastService } from '../../../../shared/ui/toast.service';

class TaskAttachmentsStoreStub {
  readonly state = signal<Record<string, TaskAttachmentsState>>({});

  loadAttachments = vi.fn().mockReturnValue(of(void 0));
  uploadAttachment = vi.fn().mockReturnValue(of(void 0));
  deleteAttachment = vi.fn().mockReturnValue(of(void 0));
  downloadAttachment = vi.fn().mockReturnValue(of(new Blob(['file'])));

  getTaskState(taskId: string): TaskAttachmentsState {
    return this.state()[taskId] ?? initialTaskAttachmentsState();
  }

  isBusy(taskId: string, attachmentId: string): boolean {
    void taskId;
    void attachmentId;
    return false;
  }
}

class ConfirmDialogServiceStub {
  confirm(options?: unknown) {
    void options;
    return of(true);
  }
}

class ToastServiceStub {
  error = vi.fn();
}

describe('TaskAttachmentsComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TaskAttachmentsComponent],
      providers: [
        { provide: TaskAttachmentsStore, useClass: TaskAttachmentsStoreStub },
        { provide: ConfirmDialogService, useClass: ConfirmDialogServiceStub },
        { provide: ToastService, useClass: ToastServiceStub }
      ]
    });
  });

  it('uploads selected file', () => {
    const fixture = TestBed.createComponent(TaskAttachmentsComponent);
    const store = TestBed.inject(TaskAttachmentsStore) as unknown as TaskAttachmentsStoreStub;
    store.state.set({
      'task-1': {
        ...initialTaskAttachmentsState(),
        status: 'success'
      }
    });

    fixture.componentInstance.taskId = 'task-1';
    fixture.detectChanges();
    fixture.componentInstance.toggleOpen();

    const file = new File(['data'], 'notiz.txt', { type: 'text/plain' });
    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => (index === 0 ? file : null)
    } as unknown as FileList;

    fixture.componentInstance.handleFileChange({ target: { files: fileList } } as unknown as Event);
    fixture.componentInstance.submitUpload();

    expect(store.uploadAttachment).toHaveBeenCalledWith('task-1', file);
  });

  it('shows loading state', () => {
    const fixture = TestBed.createComponent(TaskAttachmentsComponent);
    const store = TestBed.inject(TaskAttachmentsStore) as unknown as TaskAttachmentsStoreStub;
    store.state.set({
      'task-1': {
        ...initialTaskAttachmentsState(),
        status: 'loading'
      }
    });

    fixture.componentInstance.taskId = 'task-1';
    fixture.detectChanges();
    fixture.componentInstance.toggleOpen();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Laedt...');
  });

  it('shows empty state', () => {
    const fixture = TestBed.createComponent(TaskAttachmentsComponent);
    const store = TestBed.inject(TaskAttachmentsStore) as unknown as TaskAttachmentsStoreStub;
    store.state.set({
      'task-1': {
        ...initialTaskAttachmentsState(),
        status: 'success',
        items: []
      }
    });

    fixture.componentInstance.taskId = 'task-1';
    fixture.detectChanges();
    fixture.componentInstance.toggleOpen();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Keine Anhaenge vorhanden.');
  });

  it('shows error state', () => {
    const fixture = TestBed.createComponent(TaskAttachmentsComponent);
    const store = TestBed.inject(TaskAttachmentsStore) as unknown as TaskAttachmentsStoreStub;
    store.state.set({
      'task-1': {
        ...initialTaskAttachmentsState(),
        status: 'error',
        error: { message: 'Upload fehlgeschlagen.' }
      }
    });

    fixture.componentInstance.taskId = 'task-1';
    fixture.detectChanges();
    fixture.componentInstance.toggleOpen();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Upload fehlgeschlagen.');
  });

  it('renders attachment file names without ids', () => {
    const fixture = TestBed.createComponent(TaskAttachmentsComponent);
    const store = TestBed.inject(TaskAttachmentsStore) as unknown as TaskAttachmentsStoreStub;
    store.state.set({
      'task-1': {
        ...initialTaskAttachmentsState(),
        status: 'success',
        items: [
          {
            id: 'att-1',
            taskId: 'task-1',
            fileName: 'bericht.pdf',
            contentType: 'application/pdf',
            sizeBytes: 1200,
            uploadedAt: '2026-02-01T10:00:00Z',
            uploadedByStakeholderId: 's-1'
          }
        ]
      }
    });

    fixture.componentInstance.taskId = 'task-1';
    fixture.detectChanges();
    fixture.componentInstance.toggleOpen();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('bericht.pdf');
    expect(compiled.textContent).not.toContain('att-1');
  });
});
