import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { TasksTabPageComponent } from './tasks-tab.page';
import { TasksStore } from '../../state/tasks.store';
import { initialListState, ListState, StoreError } from '../../../../core/state/state.types';
import { Task } from '../../../../core/models/task.model';

class TasksStoreStub {
  state = signal<ListState<Task>>(initialListState());
  tasks = signal<Task[]>([]);
  status = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  error = signal<StoreError | undefined>(undefined);
  isLoading = signal(false);
  busyTaskIds = signal<Set<string>>(new Set());
  loadCalls = 0;
  setCaseIdValue: string | null = null;

  setCaseId = (caseId: string) => {
    this.setCaseIdValue = caseId;
  };
  loadTasks = () => {
    this.loadCalls += 1;
  };
  assignTask = async () => {};
  startTask = async () => {};
  blockTask = async () => {};
  unblockTask = async () => {};
  declineTask = async () => {};
  resolveTask = async () => {};
}

describe('TasksTabPageComponent', () => {
  it('shows empty state', () => {
    const store = new TasksStoreStub();
    store.status.set('success');
    store.tasks.set([]);

    TestBed.configureTestingModule({
      imports: [TasksTabPageComponent],
      providers: [
        { provide: TasksStore, useValue: store },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ caseId: 'case-1' })) } }
      ]
    });

    const fixture = TestBed.createComponent(TasksTabPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Keine Aufgaben vorhanden');
    expect(store.loadCalls).toBe(1);
  });

  it('shows error state', () => {
    const store = new TasksStoreStub();
    store.status.set('error');
    store.error.set({ message: 'Fehler' });

    TestBed.configureTestingModule({
      imports: [TasksTabPageComponent],
      providers: [
        { provide: TasksStore, useValue: store },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ caseId: 'case-1' })) } }
      ]
    });

    const fixture = TestBed.createComponent(TasksTabPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Aufgaben konnten nicht geladen werden');
    expect(compiled.textContent).toContain('Fehler');
  });
});
