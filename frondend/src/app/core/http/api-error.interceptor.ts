import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { mapApiError } from '../errors/error-mapper';

@Injectable()
export class ApiErrorInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const mapped = mapApiError(error);
        console.error('API error', {
          status: mapped.status,
          code: mapped.code,
          message: mapped.message,
          traceId: mapped.traceId
        });
        return throwError(() => mapped);
      })
    );
  }
}
