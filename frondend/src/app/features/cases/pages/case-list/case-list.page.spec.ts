import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal, computed } from '@angular/core';
import { of } from 'rxjs';
import { CaseListPageComponent } from './case-list.page';
import { CasesStore } from '../../state/cases.store';
import { initialListState, ListState } from '../../../../core/state/state.types';
import { ProcessCase } from '../../../../core/models/case.model';
import { KitasStore } from '../../../kitas/state/kitas.store';
import { LocationsStore } from '../../../locations/state/locations.store';
import { Kita } from '../../../../core/models/kita.model';
import { Location } from '../../../../core/models/location.model';

class CasesStoreStub {
  state = signal<ListState<ProcessCase>>(initialListState());
  cases = computed(() => this.state().items);
  status = computed(() => this.state().status);
  error = computed(() => this.state().error);
  isLoading = computed(() => this.state().status === 'loading');
  isEmpty = computed(() => this.state().status === 'success' && this.state().items.length === 0);
  lastCreatedId = signal<string | null>(null);
  loadCasesCalls = 0;
  createCaseCalls = 0;
  clearCreatedIdCalls = 0;
  loadCases = () => {
    this.loadCasesCalls += 1;
    return of(void 0);
  };
  createCase = () => {
    this.createCaseCalls += 1;
    return of(void 0);
  };
  clearCreatedId = () => {
    this.clearCreatedIdCalls += 1;
  };
}

class KitasStoreStub {
  state = signal<ListState<Kita>>(initialListState());
  kitas = computed(() => this.state().items);
  status = computed(() => this.state().status);
  error = computed(() => this.state().error);
  isLoading = computed(() => this.state().status === 'loading');
  isEmpty = computed(() => this.state().status === 'success' && this.state().items.length === 0);
  loadKitasCalls = 0;

  loadKitas = () => {
    this.loadKitasCalls += 1;
    return of(void 0);
  };
}

class LocationsStoreStub {
  state = signal<ListState<Location>>(initialListState());
  locations = computed(() => this.state().items);
  status = computed(() => this.state().status);
  error = computed(() => this.state().error);
  isLoading = computed(() => this.state().status === 'loading');
  loadLocationsCalls = 0;

  loadLocations = () => {
    this.loadLocationsCalls += 1;
    return of(void 0);
  };
}

describe('CaseListPageComponent', () => {
  it('shows empty state', () => {
    const store = new CasesStoreStub();
    const kitasStore = new KitasStoreStub();
    const locationsStore = new LocationsStoreStub();
    store.state.set({ items: [], status: 'success' });

    TestBed.configureTestingModule({
      imports: [CaseListPageComponent],
      providers: [
        { provide: CasesStore, useValue: store },
        { provide: KitasStore, useValue: kitasStore },
        { provide: LocationsStore, useValue: locationsStore },
        provideRouter([])
      ]
    });

    const fixture = TestBed.createComponent(CaseListPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Keine Prozesse vorhanden');
    expect(store.loadCasesCalls).toBe(1);
    expect(kitasStore.loadKitasCalls).toBe(1);
    expect(locationsStore.loadLocationsCalls).toBe(1);
  });

  it('shows error state', () => {
    const store = new CasesStoreStub();
    const kitasStore = new KitasStoreStub();
    const locationsStore = new LocationsStoreStub();
    store.state.set({
      items: [],
      status: 'error',
      error: { message: 'Fehler' }
    });

    TestBed.configureTestingModule({
      imports: [CaseListPageComponent],
      providers: [
        { provide: CasesStore, useValue: store },
        { provide: KitasStore, useValue: kitasStore },
        { provide: LocationsStore, useValue: locationsStore },
        provideRouter([])
      ]
    });

    const fixture = TestBed.createComponent(CaseListPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Daten konnten nicht geladen werden');
    expect(compiled.textContent).toContain('Fehler');
  });

  it('shows list on success', () => {
    const store = new CasesStoreStub();
    const kitasStore = new KitasStoreStub();
    const locationsStore = new LocationsStoreStub();
    store.state.set({
      items: [
        {
          id: 'case-1',
          tenantId: 't-1',
          title: 'Prozess Alpha',
          kitaId: 'kita-1',
          status: 'ACTIVE',
          stakeholders: [],
          createdAt: '2026-01-01T00:00:00Z'
        }
      ],
      status: 'success'
    });
    kitasStore.state.set({
      items: [
        {
          id: 'kita-1',
          name: 'Kita Sonnenblume',
          locationId: 'loc-1'
        }
      ],
      status: 'success'
    });

    TestBed.configureTestingModule({
      imports: [CaseListPageComponent],
      providers: [
        { provide: CasesStore, useValue: store },
        { provide: KitasStore, useValue: kitasStore },
        { provide: LocationsStore, useValue: locationsStore },
        provideRouter([])
      ]
    });

    const fixture = TestBed.createComponent(CaseListPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Prozess Alpha');
    expect(compiled.textContent).toContain('Kita Sonnenblume');
  });
});
