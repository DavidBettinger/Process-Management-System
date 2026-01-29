import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CasesApi } from './cases.api';
import { CreateCaseRequest } from '../models/case.model';
import { AddStakeholderRequest } from '../models/stakeholder.model';

describe('CasesApi', () => {
  let api: CasesApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    api = TestBed.inject(CasesApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('posts create case to /api/cases', () => {
    const payload: CreateCaseRequest = { title: 'Titel', kitaId: 'kita-1' };

    api.createCase(payload).subscribe();

    const req = httpMock.expectOne('/api/cases');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'case-1', status: 'DRAFT' });
  });

  it('gets cases list', () => {
    api.getCases().subscribe();

    const req = httpMock.expectOne('/api/cases');
    expect(req.request.method).toBe('GET');
    req.flush({ items: [] });
  });

  it('gets a case by id', () => {
    api.getCase('case-1').subscribe();

    const req = httpMock.expectOne('/api/cases/case-1');
    expect(req.request.method).toBe('GET');
    req.flush({
      id: 'case-1',
      tenantId: 't-1',
      title: 'Titel',
      kitaId: 'kita-1',
      status: 'ACTIVE',
      stakeholders: [],
      createdAt: '2026-01-01T00:00:00Z'
    });
  });

  it('adds a stakeholder', () => {
    const payload: AddStakeholderRequest = { userId: 'u-1', role: 'CONSULTANT' };

    api.addStakeholder('case-1', payload).subscribe();

    const req = httpMock.expectOne('/api/cases/case-1/stakeholders');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ caseId: 'case-1', stakeholders: [] });
  });

  it('activates a case', () => {
    api.activateCase('case-1').subscribe();

    const req = httpMock.expectOne('/api/cases/case-1/activate');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 'case-1', status: 'ACTIVE' });
  });
});
