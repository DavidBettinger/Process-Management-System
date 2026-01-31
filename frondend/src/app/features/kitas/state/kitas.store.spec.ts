import { of, throwError } from 'rxjs';
import { KitasStore } from './kitas.store';
import { KitasApi } from '../../../core/api/kitas.api';
import { CreateKitaRequest, KitasResponse } from '../../../core/models/kita.model';

describe('KitasStore', () => {
  const createApi = (overrides?: Partial<KitasApi>): KitasApi => {
    const response: KitasResponse = {
      items: [
        {
          id: 'kita-1',
          name: 'Kita Sonnenblume',
          locationId: 'location-1'
        }
      ]
    };
    return {
      listKitas: () => of(response),
      createKita: () => of({ id: 'kita-1' }),
      getKita: () => of(response.items[0]),
      ...overrides
    } as KitasApi;
  };

  it('loads kitas into state', () => {
    const store = new KitasStore(createApi());

    store.loadKitas().subscribe();

    expect(store.status()).toBe('success');
    expect(store.kitas()).toHaveLength(1);
  });

  it('stores errors when load fails', () => {
    const store = new KitasStore(createApi({
      listKitas: () => throwError(() => new Error('Fehler'))
    }));

    store.loadKitas().subscribe();

    expect(store.status()).toBe('error');
    expect(store.error()?.message).toBe('Fehler');
  });

  it('creates a kita and refreshes list', () => {
    const store = new KitasStore(createApi());
    const request: CreateKitaRequest = { name: 'Kita Sonnenblume', locationId: 'location-1' };

    store.createKita(request).subscribe();

    expect(store.status()).toBe('success');
    expect(store.kitas()).toHaveLength(1);
  });

  it('stores errors when create fails', () => {
    const store = new KitasStore(createApi({
      createKita: () => throwError(() => new Error('Fehler beim Speichern'))
    }));

    store.createKita({ name: 'Kita', locationId: 'location-1' }).subscribe();

    expect(store.status()).toBe('error');
    expect(store.error()?.message).toBe('Fehler beim Speichern');
  });
});
