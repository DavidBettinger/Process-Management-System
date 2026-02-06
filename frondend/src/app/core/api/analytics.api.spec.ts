import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AnalyticsApi } from './analytics.api';

describe('AnalyticsApi', () => {
  let api: AnalyticsApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    api = TestBed.inject(AnalyticsApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('gets timeline for a case', () => {
    api.getTimeline('case-1').subscribe();

    const req = httpMock.expectOne('/api/cases/case-1/timeline');
    expect(req.request.method).toBe('GET');
    req.flush({ caseId: 'case-1', entries: [] });
  });

  it('gets timeline graph for a case', () => {
    api.getTimelineGraph('case-1').subscribe();

    const req = httpMock.expectOne('/api/cases/case-1/timeline-graph');
    expect(req.request.method).toBe('GET');
    req.flush({
      caseId: 'case-1',
      generatedAt: '2026-02-06T12:00:00Z',
      now: '2026-02-06T12:00:00Z',
      meetings: [],
      stakeholders: [],
      tasks: []
    });
  });
});
