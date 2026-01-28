import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { DevAuthService } from '../auth/dev-auth.service';

@Injectable()
export class AuthHeaderInterceptor implements HttpInterceptor {
  constructor(private readonly devAuth: DevAuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.devAuth.enabled()) {
      return next.handle(request);
    }

    const userId = this.devAuth.userId();
    const tenantId = this.devAuth.tenantId();

    return next.handle(
      request.clone({
        setHeaders: {
          'X-Dev-UserId': userId,
          'X-Tenant-Id': tenantId
        }
      })
    );
  }
}
