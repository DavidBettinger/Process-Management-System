import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthHeaderInterceptor } from './auth-header.interceptor';
import { DevAuthService } from '../auth/dev-auth.service';

class DevAuthServiceStub {
  enabled = () => true;
  userId = () => 'u-101';
  tenantId = () => 'tenant-001';
}

class DevAuthDisabledStub {
  enabled = () => false;
  userId = () => 'u-101';
  tenantId = () => 'tenant-001';
}

describe('AuthHeaderInterceptor', () => {
  it('adds dev auth headers when enabled', () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: DevAuthService, useClass: DevAuthServiceStub },
        { provide: HTTP_INTERCEPTORS, useClass: AuthHeaderInterceptor, multi: true }
      ]
    });

    const http = TestBed.inject(HttpClient);
    const httpMock = TestBed.inject(HttpTestingController);

    http.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('X-Dev-UserId')).toBe('u-101');
    expect(req.request.headers.get('X-Tenant-Id')).toBe('tenant-001');
    req.flush({});

    httpMock.verify();
  });

  it('does not add headers when disabled', () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: DevAuthService, useClass: DevAuthDisabledStub },
        { provide: HTTP_INTERCEPTORS, useClass: AuthHeaderInterceptor, multi: true }
      ]
    });

    const http = TestBed.inject(HttpClient);
    const httpMock = TestBed.inject(HttpTestingController);

    http.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('X-Dev-UserId')).toBe(false);
    expect(req.request.headers.has('X-Tenant-Id')).toBe(false);
    req.flush({});

    httpMock.verify();
  });
});
