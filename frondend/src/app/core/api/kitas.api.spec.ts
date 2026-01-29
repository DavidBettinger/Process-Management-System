import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { KitasApi } from './kitas.api';
import { CreateKitaRequest } from '../models/kita.model';

describe('KitasApi', () => {
  let api: KitasApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    api = TestBed.inject(KitasApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('posts create kita to /api/kitas', () => {
    const payload: CreateKitaRequest = { name: 'Kita Sonnenblume', locationId: 'location-1' };

    api.createKita(payload).subscribe();

    const req = httpMock.expectOne('/api/kitas');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'kita-1' });
  });

  it('gets kitas list', () => {
    api.listKitas().subscribe();

    const req = httpMock.expectOne('/api/kitas');
    expect(req.request.method).toBe('GET');
    req.flush({ items: [] });
  });

  it('gets kita detail', () => {
    api.getKita('kita-1').subscribe();

    const req = httpMock.expectOne('/api/kitas/kita-1');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'kita-1', name: 'Kita Sonnenblume', locationId: 'location-1' });
  });
});
