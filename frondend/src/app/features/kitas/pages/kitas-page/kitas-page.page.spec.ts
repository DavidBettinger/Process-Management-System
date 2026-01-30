import { TestBed } from '@angular/core/testing';
import { signal, computed } from '@angular/core';
import { KitasPageComponent } from './kitas-page.page';
import { KitasStore } from '../../state/kitas.store';
import { LocationsStore } from '../../../locations/state/locations.store';
import { initialListState, ListState } from '../../../../core/state/state.types';
import { Kita } from '../../../../core/models/kita.model';
import { Location } from '../../../../core/models/location.model';

class KitasStoreStub {
  state = signal<ListState<Kita>>(initialListState());
  kitas = computed(() => this.state().items);
  status = computed(() => this.state().status);
  error = computed(() => this.state().error);
  isLoading = computed(() => this.state().status === 'loading');
  isEmpty = computed(() => this.state().status === 'success' && this.state().items.length === 0);
  loadKitasCalls = 0;
  createKitaCalls = 0;

  loadKitas = () => {
    this.loadKitasCalls += 1;
  };

  createKita = async () => {
    this.createKitaCalls += 1;
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
  };
}

describe('KitasPageComponent', () => {
  it('shows empty state', () => {
    const kitasStore = new KitasStoreStub();
    const locationsStore = new LocationsStoreStub();

    kitasStore.state.set({ items: [], status: 'success' });

    TestBed.configureTestingModule({
      imports: [KitasPageComponent],
      providers: [
        { provide: KitasStore, useValue: kitasStore },
        { provide: LocationsStore, useValue: locationsStore }
      ]
    });

    const fixture = TestBed.createComponent(KitasPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Keine Kitas vorhanden');
    expect(kitasStore.loadKitasCalls).toBe(1);
    expect(locationsStore.loadLocationsCalls).toBe(1);
  });

  it('shows error state', () => {
    const kitasStore = new KitasStoreStub();
    const locationsStore = new LocationsStoreStub();

    kitasStore.state.set({
      items: [],
      status: 'error',
      error: { message: 'Fehler' }
    });

    TestBed.configureTestingModule({
      imports: [KitasPageComponent],
      providers: [
        { provide: KitasStore, useValue: kitasStore },
        { provide: LocationsStore, useValue: locationsStore }
      ]
    });

    const fixture = TestBed.createComponent(KitasPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Kitas konnten nicht geladen werden');
    expect(compiled.textContent).toContain('Fehler');
  });

  it('renders kitas list', () => {
    const kitasStore = new KitasStoreStub();
    const locationsStore = new LocationsStoreStub();

    kitasStore.state.set({
      items: [
        {
          id: 'kita-1',
          name: 'Kita Sonnenblume',
          locationId: 'location-1'
        }
      ],
      status: 'success'
    });

    locationsStore.state.set({
      items: [
        {
          id: 'location-1',
          label: 'Standort Mitte',
          address: {
            street: 'Musterstrasse',
            houseNumber: '12',
            postalCode: '10115',
            city: 'Berlin',
            country: 'DE'
          }
        }
      ],
      status: 'success'
    });

    TestBed.configureTestingModule({
      imports: [KitasPageComponent],
      providers: [
        { provide: KitasStore, useValue: kitasStore },
        { provide: LocationsStore, useValue: locationsStore }
      ]
    });

    const fixture = TestBed.createComponent(KitasPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Kita Sonnenblume');
    expect(compiled.textContent).toContain('Standort Mitte');
  });
});
