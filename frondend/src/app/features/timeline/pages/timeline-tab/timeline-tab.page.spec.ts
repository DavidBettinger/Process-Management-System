import { TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { TimelineTabPageComponent } from './timeline-tab.page';
import { TimelineStore } from '../../state/timeline.store';
import { CaseTimeline } from '../../../../core/models/timeline.model';
import { LoadStatus, StoreError } from '../../../../core/state/state.types';
import { TasksStore } from '../../../tasks/state/tasks.store';
import { StakeholdersStore } from '../../../stakeholders/state/stakeholders.store';
import { LocationsStore } from '../../../locations/state/locations.store';
import { LabelResolverService } from '../../../../shared/labels/label-resolver.service';

class TimelineStoreStub {
  timeline = signal<CaseTimeline | null>(null);
  status = signal<LoadStatus>('idle');
  error = signal<StoreError | undefined>(undefined);
  isLoading = computed(() => this.status() === 'loading');
  isEmpty = computed(() => (this.timeline()?.entries.length ?? 0) === 0 && this.status() === 'success');

  setCaseIdCalls: string[] = [];
  loadTimelineCalls = 0;

  setCaseId = (caseId: string) => {
    this.setCaseIdCalls.push(caseId);
  };

  loadTimeline = () => {
    this.loadTimelineCalls += 1;
    return of(void 0);
  };
}

class TasksStoreStub {
  setCaseIdCalls: string[] = [];
  loadTasksCalls = 0;

  setCaseId = (caseId: string) => {
    this.setCaseIdCalls.push(caseId);
  };

  loadTasks = () => {
    this.loadTasksCalls += 1;
    return of(void 0);
  };
}

class StakeholdersStoreStub {
  loadStakeholdersCalls = 0;

  loadStakeholders = () => {
    this.loadStakeholdersCalls += 1;
    return of(void 0);
  };
}

class LocationsStoreStub {
  loadLocationsCalls = 0;

  loadLocations = () => {
    this.loadLocationsCalls += 1;
    return of(void 0);
  };
}

class LabelResolverServiceStub {
  taskLabel(): string {
    return 'Aufgabe';
  }

  stakeholderLabel(): string {
    return 'Person';
  }

  meetingLabel(): string {
    return 'Termin';
  }
}

describe('TimelineTabPageComponent', () => {
  it('shows empty state', () => {
    const store = new TimelineStoreStub();
    const tasksStore = new TasksStoreStub();
    store.timeline.set({ caseId: 'case-1', entries: [] });
    store.status.set('success');

    TestBed.configureTestingModule({
      imports: [TimelineTabPageComponent],
      providers: [
        { provide: TimelineStore, useValue: store },
        { provide: TasksStore, useValue: tasksStore },
        { provide: StakeholdersStore, useValue: new StakeholdersStoreStub() },
        { provide: LocationsStore, useValue: new LocationsStoreStub() },
        { provide: LabelResolverService, useClass: LabelResolverServiceStub },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ caseId: 'case-1' })) } }
      ]
    });

    const fixture = TestBed.createComponent(TimelineTabPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Noch keine Eintraege vorhanden');
    expect(store.loadTimelineCalls).toBe(1);
    expect(tasksStore.loadTasksCalls).toBe(1);
  });

  it('shows error state', () => {
    const store = new TimelineStoreStub();
    store.status.set('error');
    store.error.set({ message: 'Fehler' });

    TestBed.configureTestingModule({
      imports: [TimelineTabPageComponent],
      providers: [
        { provide: TimelineStore, useValue: store },
        { provide: TasksStore, useValue: new TasksStoreStub() },
        { provide: StakeholdersStore, useValue: new StakeholdersStoreStub() },
        { provide: LocationsStore, useValue: new LocationsStoreStub() },
        { provide: LabelResolverService, useClass: LabelResolverServiceStub },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ caseId: 'case-1' })) } }
      ]
    });

    const fixture = TestBed.createComponent(TimelineTabPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Zeitlinie konnte nicht geladen werden');
    expect(compiled.textContent).toContain('Fehler');
  });

  it('renders timeline entries', () => {
    const store = new TimelineStoreStub();
    store.timeline.set({
      caseId: 'case-1',
      entries: [{
        type: 'TASK_CREATED',
        occurredAt: '2026-02-01T10:00:00Z',
        taskId: 'task-1'
      }]
    });
    store.status.set('success');

    TestBed.configureTestingModule({
      imports: [TimelineTabPageComponent],
      providers: [
        { provide: TimelineStore, useValue: store },
        { provide: TasksStore, useValue: new TasksStoreStub() },
        { provide: StakeholdersStore, useValue: new StakeholdersStoreStub() },
        { provide: LocationsStore, useValue: new LocationsStoreStub() },
        { provide: LabelResolverService, useClass: LabelResolverServiceStub },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ caseId: 'case-1' })) } }
      ]
    });

    const fixture = TestBed.createComponent(TimelineTabPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Aufgabe erstellt');
  });
});
