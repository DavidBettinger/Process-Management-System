import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { TaskRemindersComponent } from './task-reminders.component';
import {
  TaskRemindersState,
  TaskRemindersStore,
  initialTaskRemindersState
} from '../../state/task-reminders.store';
import { ConfirmDialogService } from '../../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { ToastService } from '../../../../shared/ui/toast.service';
import { LabelResolverService } from '../../../../shared/labels/label-resolver.service';
import { Stakeholder } from '../../../../core/models/stakeholder.model';

class TaskRemindersStoreStub {
  readonly state = signal<Record<string, TaskRemindersState>>({});

  loadReminders = vi.fn().mockReturnValue(of(void 0));
  createReminder = vi.fn().mockReturnValue(of(void 0));
  deleteReminder = vi.fn().mockReturnValue(of(void 0));

  getTaskState(taskId: string): TaskRemindersState {
    return this.state()[taskId] ?? initialTaskRemindersState();
  }

  isBusy(taskId: string, reminderId: string): boolean {
    void taskId;
    void reminderId;
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

class LabelResolverServiceStub {
  stakeholderLabel(stakeholderId?: string | null): string {
    if (stakeholderId === 's-1') {
      return 'Maria Becker - Beratung';
    }
    return 'Unbekannt';
  }
}

describe('TaskRemindersComponent', () => {
  const stakeholders: Stakeholder[] = [
    {
      id: 's-1',
      firstName: 'Maria',
      lastName: 'Becker',
      role: 'CONSULTANT'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TaskRemindersComponent],
      providers: [
        { provide: TaskRemindersStore, useClass: TaskRemindersStoreStub },
        { provide: ConfirmDialogService, useClass: ConfirmDialogServiceStub },
        { provide: ToastService, useClass: ToastServiceStub },
        { provide: LabelResolverService, useClass: LabelResolverServiceStub }
      ]
    });
  });

  it('creates a reminder with selected stakeholder and time', () => {
    const fixture = TestBed.createComponent(TaskRemindersComponent);
    const store = TestBed.inject(TaskRemindersStore) as unknown as TaskRemindersStoreStub;
    store.state.set({
      'task-1': {
        ...initialTaskRemindersState(),
        status: 'success'
      }
    });

    fixture.componentInstance.taskId = 'task-1';
    fixture.componentInstance.stakeholders = stakeholders;
    fixture.detectChanges();

    fixture.componentInstance.form.controls.stakeholderId.setValue('s-1');
    fixture.componentInstance.form.controls.remindAt.setValue('2026-02-05T09:00');
    fixture.componentInstance.submit();

    const expectedRemindAt = new Date('2026-02-05T09:00').toISOString();
    expect(store.createReminder).toHaveBeenCalledWith('task-1', {
      stakeholderId: 's-1',
      remindAt: expectedRemindAt,
      note: null
    });
  });

  it('does not create a reminder when required fields are missing', () => {
    const fixture = TestBed.createComponent(TaskRemindersComponent);
    const store = TestBed.inject(TaskRemindersStore) as unknown as TaskRemindersStoreStub;

    fixture.componentInstance.taskId = 'task-1';
    fixture.componentInstance.stakeholders = stakeholders;
    fixture.detectChanges();

    fixture.componentInstance.submit();

    expect(store.createReminder).not.toHaveBeenCalled();
  });

  it('renders reminder labels without ids', () => {
    const fixture = TestBed.createComponent(TaskRemindersComponent);
    const store = TestBed.inject(TaskRemindersStore) as unknown as TaskRemindersStoreStub;
    store.state.set({
      'task-1': {
        ...initialTaskRemindersState(),
        status: 'success',
        items: [
          {
            id: 'rem-1',
            taskId: 'task-1',
            stakeholderId: 's-1',
            remindAt: '2026-02-05T09:00:00Z',
            note: 'Bitte erinnern',
            createdAt: '2026-02-01T10:00:00Z'
          }
        ]
      }
    });

    fixture.componentInstance.taskId = 'task-1';
    fixture.componentInstance.stakeholders = stakeholders;
    fixture.detectChanges();
    fixture.componentInstance.toggleOpen();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Maria Becker');
    expect(compiled.textContent).not.toContain('s-1');
    expect(compiled.textContent).not.toContain('rem-1');
  });

  it('deletes a reminder when confirmed', () => {
    const fixture = TestBed.createComponent(TaskRemindersComponent);
    const store = TestBed.inject(TaskRemindersStore) as unknown as TaskRemindersStoreStub;

    fixture.componentInstance.taskId = 'task-1';
    fixture.detectChanges();

    fixture.componentInstance.confirmDelete({
      id: 'rem-1',
      taskId: 'task-1',
      stakeholderId: 's-1',
      remindAt: '2026-02-05T09:00:00Z',
      note: null,
      createdAt: '2026-02-01T10:00:00Z'
    });

    expect(store.deleteReminder).toHaveBeenCalledWith('task-1', 'rem-1');
  });
});
