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

  it('loads kitas into state', async () => {
    const store = new KitasStore(createApi());

    await store.loadKitas();

    expect(store.status()).toBe('success');
    expect(store.kitas()).toHaveLength(1);
  });

  it('stores errors when load fails', async () => {
    const store = new KitasStore(createApi({
      listKitas: () => throwError(() => new Error('Fehler'))
    }));

    await store.loadKitas();

    expect(store.status()).toBe('error');
    expect(store.error()?.message).toBe('Fehler');
  });

  it('creates a kita and refreshes list', async () => {
    const store = new KitasStore(createApi());
    const request: CreateKitaRequest = { name: 'Kita Sonnenblume', locationId: 'location-1' };

    await store.createKita(request);

    expect(store.status()).toBe('success');
    expect(store.kitas()).toHaveLength(1);
  });

  it('stores errors when create fails', async () => {
    const store = new KitasStore(createApi({
      createKita: () => throwError(() => new Error('Fehler beim Speichern'))
    }));

    await store.createKita({ name: 'Kita', locationId: 'location-1' });

    expect(store.status()).toBe('error');
    expect(store.error()?.message).toBe('Fehler beim Speichern');
  });
});
