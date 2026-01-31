import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { TasksTabPageComponent } from './tasks-tab.page';
import { TasksStore } from '../../state/tasks.store';
import { StakeholdersStore } from '../../../stakeholders/state/stakeholders.store';
import { initialListState, ListState, StoreError } from '../../../../core/state/state.types';
import { Task } from '../../../../core/models/task.model';
import { Stakeholder } from '../../../../core/models/stakeholder.model';

class TasksStoreStub {
  state = signal<ListState<Task>>(initialListState());
  tasks = signal<Task[]>([]);
  status = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  error = signal<StoreError | undefined>(undefined);
  isLoading = signal(false);
  busyTaskIds = signal<Set<string>>(new Set());
  loadCalls = 0;
  assignCalls: { taskId: string; assigneeId: string }[] = [];
  startCalls: string[] = [];
  setCaseIdValue: string | null = null;

  setCaseId = (caseId: string) => {
    this.setCaseIdValue = caseId;
  };
  loadTasks = () => {
    this.loadCalls += 1;
    return of(void 0);
  };
  assignTask = (taskId: string, req: { assigneeId: string }) => {
    this.assignCalls.push({ taskId, assigneeId: req.assigneeId });
    return of(void 0);
  };
  startTask = (taskId: string) => {
    this.startCalls.push(taskId);
    return of(void 0);
  };
  blockTask = () => of(void 0);
  unblockTask = () => of(void 0);
  declineTask = () => of(void 0);
  resolveTask = () => of(void 0);
}

class StakeholdersStoreStub {
  state = signal<ListState<Stakeholder>>(initialListState());
  stakeholders = signal<Stakeholder[]>([]);
  status = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  error = signal<StoreError | undefined>(undefined);
  loadCalls = 0;

  loadStakeholders = () => {
    this.loadCalls += 1;
    return of(void 0);
  };
}

describe('TasksTabPageComponent', () => {
  it('shows empty state', () => {
    const store = new TasksStoreStub();
    const stakeholdersStore = new StakeholdersStoreStub();
    store.status.set('success');
    store.tasks.set([]);

    TestBed.configureTestingModule({
      imports: [TasksTabPageComponent],
      providers: [
        { provide: TasksStore, useValue: store },
        { provide: StakeholdersStore, useValue: stakeholdersStore },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ caseId: 'case-1' })) } }
      ]
    });

    const fixture = TestBed.createComponent(TasksTabPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Keine Aufgaben vorhanden');
    expect(store.loadCalls).toBe(1);
    expect(stakeholdersStore.loadCalls).toBe(1);
  });

  it('shows error state', () => {
    const store = new TasksStoreStub();
    const stakeholdersStore = new StakeholdersStoreStub();
    store.status.set('error');
    store.error.set({ message: 'Fehler' });

    TestBed.configureTestingModule({
      imports: [TasksTabPageComponent],
      providers: [
        { provide: TasksStore, useValue: store },
        { provide: StakeholdersStore, useValue: stakeholdersStore },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ caseId: 'case-1' })) } }
      ]
    });

    const fixture = TestBed.createComponent(TasksTabPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Aufgaben konnten nicht geladen werden');
    expect(compiled.textContent).toContain('Fehler');
  });

  it('calls store when assigning task', () => {
    const store = new TasksStoreStub();
    const stakeholdersStore = new StakeholdersStoreStub();

    TestBed.configureTestingModule({
      imports: [TasksTabPageComponent],
      providers: [
        { provide: TasksStore, useValue: store },
        { provide: StakeholdersStore, useValue: stakeholdersStore },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ caseId: 'case-1' })) } }
      ]
    });

    const fixture = TestBed.createComponent(TasksTabPageComponent);
    const component = fixture.componentInstance;
    component.handleAssign({ taskId: 'task-1', assigneeId: 's-1' });

    expect(store.assignCalls).toEqual([{ taskId: 'task-1', assigneeId: 's-1' }]);
  });

  it('calls store when starting task', () => {
    const store = new TasksStoreStub();
    const stakeholdersStore = new StakeholdersStoreStub();

    TestBed.configureTestingModule({
      imports: [TasksTabPageComponent],
      providers: [
        { provide: TasksStore, useValue: store },
        { provide: StakeholdersStore, useValue: stakeholdersStore },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ caseId: 'case-1' })) } }
      ]
    });

    const fixture = TestBed.createComponent(TasksTabPageComponent);
    const component = fixture.componentInstance;
    component.handleStart('task-9');

    expect(store.startCalls).toEqual(['task-9']);
  });
});
