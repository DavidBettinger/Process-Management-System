import { HttpErrorResponse } from '@angular/common/http';
import { mapApiError } from './error-mapper';

describe('mapApiError', () => {
  it('maps backend error envelope', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Ungueltige Anfrage',
        details: { field: 'title' },
        traceId: 'trace-1'
      }
    });

    const mapped = mapApiError(error);

    expect(mapped.status).toBe(400);
    expect(mapped.code).toBe('VALIDATION_ERROR');
    expect(mapped.message).toBe('Ungueltige Anfrage');
    expect(mapped.details).toEqual({ field: 'title' });
    expect(mapped.traceId).toBe('trace-1');
  });

  it('maps unknown errors', () => {
    const mapped = mapApiError('boom');

    expect(mapped.status).toBe(0);
    expect(mapped.message).toBe('Unbekannter Fehler');
  });
});
