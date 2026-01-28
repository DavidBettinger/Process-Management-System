import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models/api-error.model';

export interface MappedApiError {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
  traceId?: string;
}

export const mapApiError = (error: unknown): MappedApiError => {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as Partial<ApiError> | null;
    const message =
      body?.message ??
      (error.status === 0 ? 'Unbekannter Fehler' : error.message);
    return {
      status: error.status,
      message,
      code: body?.code,
      details: body?.details,
      traceId: body?.traceId
    };
  }

  return {
    status: 0,
    message: 'Unbekannter Fehler'
  };
};
