import { TestBed } from '@angular/core/testing';
import { signal, computed } from '@angular/core';
import { of } from 'rxjs';
import { LocationsPageComponent } from './locations-page.page';
import { LocationsStore } from '../../state/locations.store';
import { initialListState, ListState } from '../../../../core/state/state.types';
import { Location } from '../../../../core/models/location.model';

class LocationsStoreStub {
  state = signal<ListState<Location>>(initialListState());
  locations = computed(() => this.state().items);
  status = computed(() => this.state().status);
  error = computed(() => this.state().error);
  isLoading = computed(() => this.state().status === 'loading');
  isEmpty = computed(() => this.state().status === 'success' && this.state().items.length === 0);
  loadLocationsCalls = 0;
  createLocationCalls = 0;

  loadLocations = () => {
    this.loadLocationsCalls += 1;
    return of(void 0);
  };

  createLocation = () => {
    this.createLocationCalls += 1;
    return of(void 0);
  };
}

describe('LocationsPageComponent', () => {
  it('shows empty state', () => {
    const store = new LocationsStoreStub();
    store.state.set({ items: [], status: 'success' });

    TestBed.configureTestingModule({
      imports: [LocationsPageComponent],
      providers: [{ provide: LocationsStore, useValue: store }]
    });

    const fixture = TestBed.createComponent(LocationsPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Keine Standorte vorhanden');
    expect(store.loadLocationsCalls).toBe(1);
  });

  it('shows error state', () => {
    const store = new LocationsStoreStub();
    store.state.set({
      items: [],
      status: 'error',
      error: { message: 'Fehler' }
    });

    TestBed.configureTestingModule({
      imports: [LocationsPageComponent],
      providers: [{ provide: LocationsStore, useValue: store }]
    });

    const fixture = TestBed.createComponent(LocationsPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Standorte konnten nicht geladen werden');
    expect(compiled.textContent).toContain('Fehler');
  });

  it('renders locations list', () => {
    const store = new LocationsStoreStub();
    store.state.set({
      items: [
        {
          id: 'loc-1',
          label: 'Kita Sonnenblume',
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
      imports: [LocationsPageComponent],
      providers: [{ provide: LocationsStore, useValue: store }]
    });

    const fixture = TestBed.createComponent(LocationsPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Kita Sonnenblume');
    expect(compiled.textContent).toContain('Berlin');
  });
});
