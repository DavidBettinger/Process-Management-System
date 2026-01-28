export type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

export interface StoreError {
  code?: string;
  message: string;
  details?: unknown;
  traceId?: string;
}

export interface EntityState<T> {
  data: T | null;
  status: LoadStatus;
  error?: StoreError;
}

export interface ListState<T> {
  items: T[];
  status: LoadStatus;
  error?: StoreError;
}

export const initialEntityState = <T>(): EntityState<T> => ({
  data: null,
  status: 'idle',
  error: undefined
});

export const initialListState = <T>(): ListState<T> => ({
  items: [],
  status: 'idle',
  error: undefined
});

export const toStoreError = (error: unknown): StoreError => {
  if (error && typeof error === 'object') {
    const message = typeof (error as { message?: unknown }).message === 'string'
      ? (error as { message: string }).message
      : 'Unbekannter Fehler';
    return {
      code: typeof (error as { code?: unknown }).code === 'string' ? (error as { code: string }).code : undefined,
      message,
      details: (error as { details?: unknown }).details,
      traceId: typeof (error as { traceId?: unknown }).traceId === 'string'
        ? (error as { traceId: string }).traceId
        : undefined
    };
  }
  return { message: 'Unbekannter Fehler' };
};
