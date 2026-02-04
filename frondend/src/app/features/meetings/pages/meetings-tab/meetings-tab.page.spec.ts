import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MeetingsTabPageComponent } from './meetings-tab.page';
import { MeetingsStore } from '../../state/meetings.store';
import { LocationsStore } from '../../../locations/state/locations.store';
import { KitasStore } from '../../../kitas/state/kitas.store';
import { CaseDetailStore } from '../../../case-detail/state/case-detail.store';
import { StakeholdersStore } from '../../../stakeholders/state/stakeholders.store';
import { Meeting } from '../../../../core/models/meeting.model';
import { Location } from '../../../../core/models/location.model';
import { Kita } from '../../../../core/models/kita.model';
import { Stakeholder } from '../../../../core/models/stakeholder.model';
import { initialListState, ListState, StoreError } from '../../../../core/state/state.types';

class MeetingsStoreStub {
  meetings = signal<Meeting[]>([]);
  status = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  error = signal<StoreError | undefined>(undefined);
  isLoading = signal(false);
  holdResult = signal(null);
  setCaseIdValue: string | null = null;
  clearHoldResultCalls = 0;
  loadCalls = 0;

  setCaseId = (caseId: string) => {
    this.setCaseIdValue = caseId;
  };
  clearHoldResult = () => {
    this.clearHoldResultCalls += 1;
  };
  loadMeetings = () => {
    this.loadCalls += 1;
    return of(void 0);
  };
  scheduleMeeting = () => of(void 0);
  holdMeeting = () => of(void 0);
}

class LocationsStoreStub {
  state = signal<ListState<Location>>(initialListState());
  locations = signal<Location[]>([]);
  status = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  error = signal<StoreError | undefined>(undefined);
  loadCalls = 0;

  loadLocations = () => {
    this.loadCalls += 1;
    return of(void 0);
  };
}

class KitasStoreStub {
  kitas = signal<Kita[]>([]);
  loadCalls = 0;

  loadKitas = () => {
    this.loadCalls += 1;
    return of(void 0);
  };
}

class CaseDetailStoreStub {
  caseData = signal(null);
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

describe('MeetingsTabPageComponent', () => {
  it('loads stakeholders on init', () => {
    const meetingsStore = new MeetingsStoreStub();
    const locationsStore = new LocationsStoreStub();
    const kitasStore = new KitasStoreStub();
    const caseStore = new CaseDetailStoreStub();
    const stakeholdersStore = new StakeholdersStoreStub();

    TestBed.configureTestingModule({
      imports: [MeetingsTabPageComponent],
      providers: [
        provideRouter([]),
        { provide: MeetingsStore, useValue: meetingsStore },
        { provide: LocationsStore, useValue: locationsStore },
        { provide: KitasStore, useValue: kitasStore },
        { provide: CaseDetailStore, useValue: caseStore },
        { provide: StakeholdersStore, useValue: stakeholdersStore },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ caseId: 'case-1' })) } }
      ]
    });

    const fixture = TestBed.createComponent(MeetingsTabPageComponent);
    fixture.detectChanges();

    expect(stakeholdersStore.loadCalls).toBe(1);
    expect(locationsStore.loadCalls).toBe(1);
    expect(kitasStore.loadCalls).toBe(1);
    expect(meetingsStore.loadCalls).toBe(1);
  });

  it('shows stakeholder error state', () => {
    const meetingsStore = new MeetingsStoreStub();
    const locationsStore = new LocationsStoreStub();
    const kitasStore = new KitasStoreStub();
    const caseStore = new CaseDetailStoreStub();
    const stakeholdersStore = new StakeholdersStoreStub();
    stakeholdersStore.status.set('error');
    stakeholdersStore.error.set({ message: 'Fehler' });

    TestBed.configureTestingModule({
      imports: [MeetingsTabPageComponent],
      providers: [
        provideRouter([]),
        { provide: MeetingsStore, useValue: meetingsStore },
        { provide: LocationsStore, useValue: locationsStore },
        { provide: KitasStore, useValue: kitasStore },
        { provide: CaseDetailStore, useValue: caseStore },
        { provide: StakeholdersStore, useValue: stakeholdersStore },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ caseId: 'case-1' })) } }
      ]
    });

    const fixture = TestBed.createComponent(MeetingsTabPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Beteiligte konnten nicht geladen werden');
    expect(compiled.textContent).toContain('Fehler');
  });
});
