import { of, throwError } from 'rxjs';
import { TimelineStore } from './timeline.store';
import { AnalyticsApi } from '../../../core/api/analytics.api';

describe('TimelineStore', () => {
  const createApi = (overrides?: Partial<AnalyticsApi>): AnalyticsApi => {
    return {
      getTimeline: () => of({
        caseId: 'case-1',
        entries: [{
          type: 'TASK_CREATED',
          occurredAt: '2026-01-01T00:00:00Z',
          taskId: 'task-1',
          meetingId: null,
          assigneeId: null
        }]
      }),
      ...overrides
    } as AnalyticsApi;
  };

  it('loads timeline entries', () => {
    const store = new TimelineStore(createApi());

    store.setCaseId('case-1');
    store.loadTimeline().subscribe();

    expect(store.timeline()?.entries.length).toBe(1);
    expect(store.timeline()?.entries[0].type).toBe('TASK_CREATED');
    expect(store.status()).toBe('success');
  });

  it('stores errors', () => {
    const store = new TimelineStore(createApi({
      getTimeline: () => throwError(() => new Error('Fehler'))
    }));

    store.setCaseId('case-1');
    store.loadTimeline().subscribe();

    expect(store.status()).toBe('error');
    expect(store.error()?.message).toBe('Fehler');
  });

  it('sets error when caseId is missing', () => {
    const store = new TimelineStore(createApi());

    store.loadTimeline().subscribe();

    expect(store.status()).toBe('error');
    expect(store.error()?.code).toBe('MISSING_CASE_ID');
  });
});
