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
    api.getStakeholders(1, 10, 'lastName,asc').subscribe();

    const req = httpMock.expectOne('/api/stakeholders?page=1&size=10&sort=lastName,asc');
    expect(req.request.method).toBe('GET');
    req.flush({ items: [], page: 1, size: 10, totalItems: 0, totalPages: 0 });
  });

  it('gets stakeholder tasks', () => {
    api.getStakeholderTasks('s-1', 0, 20, 'dueDate,asc').subscribe();

    const req = httpMock.expectOne('/api/stakeholders/s-1/tasks?page=0&size=20&sort=dueDate,asc');
    expect(req.request.method).toBe('GET');
    req.flush({
      stakeholderId: 's-1',
      items: [],
      page: 0,
      size: 20,
      totalItems: 0,
      totalPages: 0
    });
  });
});
