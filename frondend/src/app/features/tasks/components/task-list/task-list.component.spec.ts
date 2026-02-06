import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TaskListComponent } from './task-list.component';
import { LabelResolverService } from '../../../../shared/labels/label-resolver.service';
import { TaskAttachmentsStore } from '../../state/task-attachments.store';
import { TaskRemindersStore } from '../../state/task-reminders.store';
import { ConfirmDialogService } from '../../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { ToastService } from '../../../../shared/ui/toast.service';
import { of } from 'rxjs';

class LabelResolverServiceStub {
  stakeholderLabel(id?: string | null): string {
    return id === 's-1' ? 'Maria Becker — Beratung' : 'Unbekannt';
  }
}

class TaskAttachmentsStoreStub {
  getTaskState() {
    return { status: 'idle', items: [], error: undefined, uploading: false, busyIds: new Set() };
  }
  loadAttachments = () => of(void 0);
  uploadAttachment = () => of(void 0);
  deleteAttachment = () => of(void 0);
  downloadAttachment = () => of(new Blob());
  isBusy() {
    return false;
  }
}

class TaskRemindersStoreStub {
  getTaskState() {
    return { status: 'idle', items: [], error: undefined, creating: false, busyIds: new Set() };
  }
  loadReminders = () => of(void 0);
  createReminder = () => of(void 0);
  deleteReminder = () => of(void 0);
  isBusy() {
    return false;
  }
}

class ConfirmDialogServiceStub {
  confirm() {
    return of(true);
  }
}

class ToastServiceStub {
  error() {}
}

describe('TaskListComponent', () => {
  it('renders task title and assignee label without showing ids', () => {
    TestBed.configureTestingModule({
      imports: [TaskListComponent, HttpClientTestingModule],
      providers: [
        { provide: LabelResolverService, useClass: LabelResolverServiceStub },
        { provide: TaskAttachmentsStore, useClass: TaskAttachmentsStoreStub },
        { provide: TaskRemindersStore, useClass: TaskRemindersStoreStub },
        { provide: ConfirmDialogService, useClass: ConfirmDialogServiceStub },
        { provide: ToastService, useClass: ToastServiceStub }
      ]
    });

    const fixture = TestBed.createComponent(TaskListComponent);
    fixture.componentInstance.tasks = [
      {
        id: 'task-1',
        title: 'Kinderschutz-Konzept',
        description: 'Kurzbeschreibung',
        priority: 1,
        state: 'ASSIGNED',
        assigneeId: 's-1'
      }
    ];
    fixture.componentInstance.stakeholders = [
      { id: 's-1', firstName: 'Maria', lastName: 'Becker', role: 'CONSULTANT' }
    ];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Kinderschutz-Konzept');
    expect(compiled.textContent).toContain('Sehr wichtig');
    expect(compiled.textContent).toContain('Maria Becker');
    expect(compiled.textContent).not.toContain('task-1');
    expect(compiled.textContent).not.toContain('s-1');
  });

  it('collapses tasks by default when multiple tasks exist and shows summary fields', () => {
    TestBed.configureTestingModule({
      imports: [TaskListComponent, HttpClientTestingModule],
      providers: [
        { provide: LabelResolverService, useClass: LabelResolverServiceStub },
        { provide: TaskAttachmentsStore, useClass: TaskAttachmentsStoreStub },
        { provide: TaskRemindersStore, useClass: TaskRemindersStoreStub },
        { provide: ConfirmDialogService, useClass: ConfirmDialogServiceStub },
        { provide: ToastService, useClass: ToastServiceStub }
      ]
    });

    const fixture = TestBed.createComponent(TaskListComponent);
    fixture.componentInstance.tasks = [
      {
        id: 'task-1',
        title: 'Erste Aufgabe',
        description: 'Detail A',
        priority: 2,
        state: 'OPEN',
        assigneeId: null
      },
      {
        id: 'task-2',
        title: 'Zweite Aufgabe',
        description: 'Detail B',
        priority: 1,
        state: 'ASSIGNED',
        assigneeId: 's-1'
      }
    ];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('[data-testid="task-details"]').length).toBe(0);
    expect(compiled.textContent).toContain('Erste Aufgabe');
    expect(compiled.textContent).toContain('Zweite Aufgabe');
    expect(compiled.textContent).toContain('Offen');
    expect(compiled.textContent).toContain('Zugewiesen');
    expect(compiled.textContent).toContain('Nicht zugewiesen');
    expect(compiled.textContent).toContain('Maria Becker');
  });

  it('expands task details when summary is clicked', () => {
    TestBed.configureTestingModule({
      imports: [TaskListComponent, HttpClientTestingModule],
      providers: [
        { provide: LabelResolverService, useClass: LabelResolverServiceStub },
        { provide: TaskAttachmentsStore, useClass: TaskAttachmentsStoreStub },
        { provide: TaskRemindersStore, useClass: TaskRemindersStoreStub },
        { provide: ConfirmDialogService, useClass: ConfirmDialogServiceStub },
        { provide: ToastService, useClass: ToastServiceStub }
      ]
    });

    const fixture = TestBed.createComponent(TaskListComponent);
    fixture.componentInstance.tasks = [
      {
        id: 'task-1',
        title: 'Erste Aufgabe',
        description: 'Detail A',
        priority: 2,
        state: 'OPEN',
        assigneeId: null
      },
      {
        id: 'task-2',
        title: 'Zweite Aufgabe',
        description: 'Detail B',
        priority: 1,
        state: 'ASSIGNED',
        assigneeId: 's-1'
      }
    ];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const summaryButton = Array.from(compiled.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Erste Aufgabe')
    ) as HTMLButtonElement;

    summaryButton.click();
    fixture.detectChanges();

    const details = compiled.querySelectorAll('[data-testid="task-details"]');
    expect(details.length).toBe(1);
    expect(details[0]?.textContent).toContain('Detail A');
  });

  it('keeps only one task expanded at a time', () => {
    TestBed.configureTestingModule({
      imports: [TaskListComponent, HttpClientTestingModule],
      providers: [
        { provide: LabelResolverService, useClass: LabelResolverServiceStub },
        { provide: TaskAttachmentsStore, useClass: TaskAttachmentsStoreStub },
        { provide: TaskRemindersStore, useClass: TaskRemindersStoreStub },
        { provide: ConfirmDialogService, useClass: ConfirmDialogServiceStub },
        { provide: ToastService, useClass: ToastServiceStub }
      ]
    });

    const fixture = TestBed.createComponent(TaskListComponent);
    fixture.componentInstance.tasks = [
      {
        id: 'task-1',
        title: 'Erste Aufgabe',
        description: 'Detail A',
        priority: 2,
        state: 'OPEN',
        assigneeId: null
      },
      {
        id: 'task-2',
        title: 'Zweite Aufgabe',
        description: 'Detail B',
        priority: 1,
        state: 'ASSIGNED',
        assigneeId: 's-1'
      }
    ];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const summaryButtons = Array.from(compiled.querySelectorAll('button')).filter((button) =>
      button.textContent?.includes('Aufgabe')
    ) as HTMLButtonElement[];

    summaryButtons[0].click();
    fixture.detectChanges();
    expect(compiled.querySelectorAll('[data-testid="task-details"]').length).toBe(1);
    expect(compiled.textContent).toContain('Detail A');

    summaryButtons[1].click();
    fixture.detectChanges();

    const details = compiled.querySelectorAll('[data-testid="task-details"]');
    expect(details.length).toBe(1);
    expect(details[0]?.textContent).toContain('Detail B');
    expect(details[0]?.textContent).not.toContain('Detail A');
  });
});
