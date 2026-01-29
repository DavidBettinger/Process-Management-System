import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LocationsApi } from './locations.api';
import { CreateLocationRequest } from '../models/location.model';

describe('LocationsApi', () => {
  let api: LocationsApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    api = TestBed.inject(LocationsApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('posts create location to /api/locations', () => {
    const payload: CreateLocationRequest = {
      label: 'Kita Sonnenblume',
      address: {
        street: 'Musterstrasse',
        houseNumber: '12',
        postalCode: '10115',
        city: 'Berlin',
        country: 'DE'
      }
    };

    api.createLocation(payload).subscribe();

    const req = httpMock.expectOne('/api/locations');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'location-1' });
  });

  it('gets locations list', () => {
    api.listLocations().subscribe();

    const req = httpMock.expectOne('/api/locations');
    expect(req.request.method).toBe('GET');
    req.flush({ items: [] });
  });

  it('gets location detail', () => {
    api.getLocation('location-1').subscribe();

    const req = httpMock.expectOne('/api/locations/location-1');
    expect(req.request.method).toBe('GET');
    req.flush({
      id: 'location-1',
      label: 'Kita Sonnenblume',
      address: {
        street: 'Musterstrasse',
        houseNumber: '12',
        postalCode: '10115',
        city: 'Berlin',
        country: 'DE'
      }
    });
  });
});
