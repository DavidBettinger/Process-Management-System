import { TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { StakeholderDetailPageComponent } from './stakeholder-detail-page.page';
import { StakeholderDetailStore } from '../../state/stakeholder-detail.store';
import { EntityState, initialEntityState, LoadStatus, StoreError } from '../../../../core/state/state.types';
import { Stakeholder } from '../../../../core/models/stakeholder.model';
import { StakeholderTaskSummary } from '../../../../core/models/task.model';
import { CasesStore } from '../../../cases/state/cases.store';
import { LabelResolverService } from '../../../../shared/labels/label-resolver.service';

type TasksState = {
  status: LoadStatus;
  items: StakeholderTaskSummary[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  error?: StoreError;
};

const initialTasksState = (): TasksState => ({
  status: 'idle',
  items: [],
  page: 0,
  size: 20,
  totalItems: 0,
  totalPages: 0,
  error: undefined
});

class StakeholderDetailStoreStub {
  stakeholderId = signal<string | null>(null);
  profileState = signal<EntityState<Stakeholder>>(initialEntityState());
  tasksState = signal<TasksState>(initialTasksState());

  profile = computed(() => this.profileState().data);
  profileStatus = computed(() => this.profileState().status);
  profileError = computed(() => this.profileState().error);
  tasks = computed(() => this.tasksState().items);
  tasksStatus = computed(() => this.tasksState().status);
  tasksError = computed(() => this.tasksState().error);
  page = computed(() => this.tasksState().page);
  size = computed(() => this.tasksState().size);
  totalItems = computed(() => this.tasksState().totalItems);
  totalPages = computed(() => this.tasksState().totalPages);
  hasNext = computed(() => this.page() < Math.max(this.totalPages() - 1, 0));
  hasPrev = computed(() => this.page() > 0);

  setStakeholderIdCalls: string[] = [];
  loadProfileCalls = 0;
  loadTasksCalls = 0;

  setStakeholderId = (id: string) => {
    this.setStakeholderIdCalls.push(id);
    this.stakeholderId.set(id);
  };

  loadProfile = async () => {
    this.loadProfileCalls += 1;
  };

  loadTasks = async () => {
    this.loadTasksCalls += 1;
  };

  nextPage = async () => {};
  prevPage = async () => {};
  setPageSize = async () => {};
}

class CasesStoreStub {
  loadCases = async () => {};
}

class LabelResolverServiceStub {
  processLabel(caseId?: string | null): string {
    return caseId === 'case-1' ? 'Kinderschutz' : 'Unbekannt';
  }
}

describe('StakeholderDetailPageComponent', () => {
  it('renders header label', () => {
    const store = new StakeholderDetailStoreStub();
    store.profileState.set({
      data: { id: 's-1', firstName: 'Maria', lastName: 'Becker', role: 'CONSULTANT' },
      status: 'success'
    });
    store.tasksState.set({ ...initialTasksState(), status: 'success', items: [] });

    TestBed.configureTestingModule({
      imports: [StakeholderDetailPageComponent],
      providers: [
        { provide: StakeholderDetailStore, useValue: store },
        { provide: CasesStore, useValue: new CasesStoreStub() },
        { provide: LabelResolverService, useClass: LabelResolverServiceStub },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ stakeholderId: 's-1' })) } }
      ]
    });

    const fixture = TestBed.createComponent(StakeholderDetailPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Maria Becker');
    expect(compiled.textContent).toContain('Beratung');
  });

  it('shows empty state when no tasks are assigned', () => {
    const store = new StakeholderDetailStoreStub();
    store.profileState.set({
      data: { id: 's-1', firstName: 'Maria', lastName: 'Becker', role: 'CONSULTANT' },
      status: 'success'
    });
    store.tasksState.set({ ...initialTasksState(), status: 'success', items: [] });

    TestBed.configureTestingModule({
      imports: [StakeholderDetailPageComponent],
      providers: [
        { provide: StakeholderDetailStore, useValue: store },
        { provide: CasesStore, useValue: new CasesStoreStub() },
        { provide: LabelResolverService, useClass: LabelResolverServiceStub },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ stakeholderId: 's-1' })) } }
      ]
    });

    const fixture = TestBed.createComponent(StakeholderDetailPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Keine Aufgaben zugeordnet');
  });

  it('enables and disables pagination buttons correctly', () => {
    const store = new StakeholderDetailStoreStub();
    store.profileState.set({
      data: { id: 's-1', firstName: 'Maria', lastName: 'Becker', role: 'CONSULTANT' },
      status: 'success'
    });
    store.tasksState.set({
      status: 'success',
      items: [{
        id: 't-1',
        caseId: 'case-1',
        title: 'Konzept',
        state: 'ASSIGNED',
        assigneeId: 's-1',
        dueDate: '2026-02-10'
      }],
      page: 0,
      size: 20,
      totalItems: 2,
      totalPages: 2,
      error: undefined
    });

    TestBed.configureTestingModule({
      imports: [StakeholderDetailPageComponent],
      providers: [
        { provide: StakeholderDetailStore, useValue: store },
        { provide: CasesStore, useValue: new CasesStoreStub() },
        { provide: LabelResolverService, useClass: LabelResolverServiceStub },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ stakeholderId: 's-1' })) } }
      ]
    });

    const fixture = TestBed.createComponent(StakeholderDetailPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('.pagination-button') as NodeListOf<HTMLButtonElement>;
    expect(buttons.length).toBe(2);
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].disabled).toBe(false);
  });

  it('renders process title instead of case id', () => {
    const store = new StakeholderDetailStoreStub();
    store.profileState.set({
      data: { id: 's-1', firstName: 'Maria', lastName: 'Becker', role: 'CONSULTANT' },
      status: 'success'
    });
    store.tasksState.set({
      status: 'success',
      items: [{
        id: 't-1',
        caseId: 'case-1',
        title: 'Konzept',
        state: 'ASSIGNED',
        assigneeId: 's-1',
        dueDate: '2026-02-10'
      }],
      page: 0,
      size: 20,
      totalItems: 1,
      totalPages: 1,
      error: undefined
    });

    TestBed.configureTestingModule({
      imports: [StakeholderDetailPageComponent],
      providers: [
        { provide: StakeholderDetailStore, useValue: store },
        { provide: CasesStore, useValue: new CasesStoreStub() },
        { provide: LabelResolverService, useClass: LabelResolverServiceStub },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ stakeholderId: 's-1' })) } }
      ]
    });

    const fixture = TestBed.createComponent(StakeholderDetailPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Kinderschutz');
    expect(compiled.textContent).not.toContain('case-1');
  });
});
