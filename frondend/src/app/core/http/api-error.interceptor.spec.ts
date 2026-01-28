import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiErrorInterceptor } from './api-error.interceptor';

describe('ApiErrorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ApiErrorInterceptor,
          multi: true
        }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('maps error responses into normalized shape', () => {
    let received: unknown;

    http.get('/api/test').subscribe({
      error: (error) => {
        received = error;
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.flush(
      {
        code: 'NOT_FOUND',
        message: 'Nicht gefunden',
        details: null,
        traceId: 'trace-2'
      },
      { status: 404, statusText: 'Not Found' }
    );

    const mapped = received as {
      status: number;
      code?: string;
      message: string;
      traceId?: string;
    };

    expect(mapped.status).toBe(404);
    expect(mapped.code).toBe('NOT_FOUND');
    expect(mapped.message).toBe('Nicht gefunden');
    expect(mapped.traceId).toBe('trace-2');
  });

  it('still throws mapped error on network failure', () => {
    let received: unknown;

    http.get('/api/test').subscribe({
      error: (error) => {
        received = error;
      }
    });

    const req = httpMock.expectOne('/api/test');
    req.error(new ProgressEvent('error'));

    const mapped = received as { status: number; message: string };

    expect(mapped.status).toBe(0);
    expect(mapped.message).toContain('Unbekannter Fehler');
  });
});
