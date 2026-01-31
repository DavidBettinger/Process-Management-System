import { of, throwError } from 'rxjs';
import { LocationsStore } from './locations.store';
import { LocationsApi } from '../../../core/api/locations.api';
import { CreateLocationRequest, LocationsResponse } from '../../../core/models/location.model';

describe('LocationsStore', () => {
  const createApi = (overrides?: Partial<LocationsApi>): LocationsApi => {
    const response: LocationsResponse = {
      items: [
        {
          id: 'location-1',
          label: 'Kita Sonnenblume',
          address: {
            street: 'Musterstrasse',
            houseNumber: '12',
            postalCode: '10115',
            city: 'Berlin',
            country: 'DE'
          }
        }
      ]
    };
    return {
      listLocations: () => of(response),
      createLocation: () => of({ id: 'location-1' }),
      getLocation: () => of(response.items[0]),
      ...overrides
    } as LocationsApi;
  };

  it('loads locations into state', () => {
    const store = new LocationsStore(createApi());

    store.loadLocations().subscribe();

    expect(store.status()).toBe('success');
    expect(store.locations()).toHaveLength(1);
  });

  it('stores errors when load fails', () => {
    const store = new LocationsStore(createApi({
      listLocations: () => throwError(() => new Error('Fehler'))
    }));

    store.loadLocations().subscribe();

    expect(store.status()).toBe('error');
    expect(store.error()?.message).toBe('Fehler');
  });

  it('creates a location and refreshes list', () => {
    const store = new LocationsStore(createApi());
    const request: CreateLocationRequest = {
      label: 'Kita Sonnenblume',
      address: {
        street: 'Musterstrasse',
        houseNumber: '12',
        postalCode: '10115',
        city: 'Berlin',
        country: 'DE'
      }
    };

    store.createLocation(request).subscribe();

    expect(store.status()).toBe('success');
    expect(store.locations()).toHaveLength(1);
  });

  it('stores errors when create fails', () => {
    const store = new LocationsStore(createApi({
      createLocation: () => throwError(() => new Error('Fehler beim Speichern'))
    }));

    store.createLocation({
      label: 'Kita',
      address: {
        street: 'Musterstrasse',
        houseNumber: '12',
        postalCode: '10115',
        city: 'Berlin',
        country: 'DE'
      }
    }).subscribe();

    expect(store.status()).toBe('error');
    expect(store.error()?.message).toBe('Fehler beim Speichern');
  });
});
