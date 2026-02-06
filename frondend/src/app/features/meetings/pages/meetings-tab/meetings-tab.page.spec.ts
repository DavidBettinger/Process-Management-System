import { TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MeetingsTabPageComponent } from './meetings-tab.page';
import { MeetingsStore } from '../../state/meetings.store';
import { LocationsStore } from '../../../locations/state/locations.store';
import { KitasStore } from '../../../kitas/state/kitas.store';
import { CaseDetailStore } from '../../../case-detail/state/case-detail.store';
import { StakeholdersStore } from '../../../stakeholders/state/stakeholders.store';
import { Meeting, ScheduleMeetingRequest } from '../../../../core/models/meeting.model';
import { Location } from '../../../../core/models/location.model';
import { Kita } from '../../../../core/models/kita.model';
import { Stakeholder } from '../../../../core/models/stakeholder.model';
import { initialListState, ListState, StoreError } from '../../../../core/state/state.types';
import { ConfirmDialogComponent } from '../../../../shared/ui/confirm-dialog/confirm-dialog.component';

class MeetingsStoreStub {
  meetings = signal<Meeting[]>([]);
  status = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  error = signal<StoreError | undefined>(undefined);
  isLoading = signal(false);
  holdResult = signal(null);
  scheduleCalls: ScheduleMeetingRequest[] = [];
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
  scheduleMeeting = (req: ScheduleMeetingRequest) => {
    this.scheduleCalls.push(req);
    return of(void 0);
  };
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

@Component({
  template: '<app-meetings-tab-page></app-meetings-tab-page><app-confirm-dialog></app-confirm-dialog>',
  standalone: true,
  imports: [MeetingsTabPageComponent, ConfirmDialogComponent]
})
class MeetingsTabHostComponent {}

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

  it('opens schedule overlay', () => {
    const meetingsStore = new MeetingsStoreStub();
    const locationsStore = new LocationsStoreStub();
    const kitasStore = new KitasStoreStub();
    const caseStore = new CaseDetailStoreStub();
    const stakeholdersStore = new StakeholdersStoreStub();

    TestBed.configureTestingModule({
      imports: [MeetingsTabHostComponent],
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

    const fixture = TestBed.createComponent(MeetingsTabHostComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const openButton = Array.from(compiled.querySelectorAll('button')).find((button) =>
      button.textContent?.trim().includes('Termin planen')
    ) as HTMLButtonElement;

    openButton.click();
    fixture.detectChanges();

    const dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).not.toBeNull();
    expect(dialog.textContent).toContain('Termin planen');
  });

  it('closes schedule overlay on cancel and clears form', () => {
    const meetingsStore = new MeetingsStoreStub();
    const locationsStore = new LocationsStoreStub();
    const kitasStore = new KitasStoreStub();
    const caseStore = new CaseDetailStoreStub();
    const stakeholdersStore = new StakeholdersStoreStub();
    locationsStore.locations.set([
      {
        id: 'loc-1',
        label: 'Standort A',
        address: { street: 'x', houseNumber: '1', postalCode: '10115', city: 'Berlin', country: 'DE' }
      }
    ]);

    TestBed.configureTestingModule({
      imports: [MeetingsTabHostComponent],
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

    const fixture = TestBed.createComponent(MeetingsTabHostComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const openButton = Array.from(compiled.querySelectorAll('button')).find((button) =>
      button.textContent?.trim().includes('Termin planen')
    ) as HTMLButtonElement;

    openButton.click();
    fixture.detectChanges();

    let dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;
    const scheduledInput = dialog.querySelector('#meeting-scheduled-at') as HTMLInputElement;
    scheduledInput.value = '2026-02-01T10:00';
    scheduledInput.dispatchEvent(new Event('input'));

    const locationSelect = dialog.querySelector('#meeting-location') as HTMLSelectElement;
    locationSelect.value = 'loc-1';
    locationSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const cancelButton = Array.from(dialog.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Abbrechen')
    ) as HTMLButtonElement;

    cancelButton.click();
    fixture.detectChanges();

    expect(compiled.querySelector('[role="dialog"]')).toBeNull();

    openButton.click();
    fixture.detectChanges();

    dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;
    const reopenedScheduled = dialog.querySelector('#meeting-scheduled-at') as HTMLInputElement;
    const reopenedLocation = dialog.querySelector('#meeting-location') as HTMLSelectElement;
    expect(reopenedScheduled.value).toBe('');
    expect(reopenedLocation.value).toBe('');
  });

  it('submits schedule form with expected payload', () => {
    const meetingsStore = new MeetingsStoreStub();
    const locationsStore = new LocationsStoreStub();
    const kitasStore = new KitasStoreStub();
    const caseStore = new CaseDetailStoreStub();
    const stakeholdersStore = new StakeholdersStoreStub();
    stakeholdersStore.status.set('success');
    stakeholdersStore.stakeholders.set([
      { id: 's-1', firstName: 'Ada', lastName: 'Lovelace', role: 'CONSULTANT' }
    ]);
    locationsStore.locations.set([
      {
        id: 'loc-1',
        label: 'Standort A',
        address: { street: 'x', houseNumber: '1', postalCode: '10115', city: 'Berlin', country: 'DE' }
      }
    ]);

    TestBed.configureTestingModule({
      imports: [MeetingsTabHostComponent],
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

    const fixture = TestBed.createComponent(MeetingsTabHostComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const openButton = Array.from(compiled.querySelectorAll('button')).find((button) =>
      button.textContent?.trim().includes('Termin planen')
    ) as HTMLButtonElement;

    openButton.click();
    fixture.detectChanges();

    const dialog = compiled.querySelector('[role="dialog"]') as HTMLElement;
    const scheduledInput = dialog.querySelector('#meeting-scheduled-at') as HTMLInputElement;
    scheduledInput.value = '2026-02-01T10:00';
    scheduledInput.dispatchEvent(new Event('input'));

    const locationSelect = dialog.querySelector('#meeting-location') as HTMLSelectElement;
    locationSelect.value = 'loc-1';
    locationSelect.dispatchEvent(new Event('change'));

    const stakeholderSelect = dialog.querySelector('app-stakeholder-select select') as HTMLSelectElement;
    stakeholderSelect.value = 's-1';
    stakeholderSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const submitButton = Array.from(dialog.querySelectorAll('button')).find((button) =>
      button.textContent?.trim().includes('Termin planen')
    ) as HTMLButtonElement;
    submitButton.click();
    fixture.detectChanges();

    const expectedDate = new Date('2026-02-01T10:00').toISOString();
    expect(meetingsStore.scheduleCalls).toEqual([
      {
        scheduledAt: expectedDate,
        locationId: 'loc-1',
        participantIds: ['s-1']
      }
    ]);
  });
});
