import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StakeholdersApi } from './stakeholders.api';

describe('StakeholdersApi', () => {
  let api: StakeholdersApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StakeholdersApi, provideHttpClient(), provideHttpClientTesting()]
    });
    api = TestBed.inject(StakeholdersApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('posts create stakeholder to /api/stakeholders', () => {
    api.createStakeholder({ firstName: 'Maria', lastName: 'Becker', role: 'CONSULTANT' }).subscribe();

    const req = httpMock.expectOne('/api/stakeholders');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 's-1' });
  });

  it('gets stakeholders list', () => {
    api.listStakeholders().subscribe();

    const req = httpMock.expectOne('/api/stakeholders');
    expect(req.request.method).toBe('GET');
    req.flush({ items: [] });
  });
});
