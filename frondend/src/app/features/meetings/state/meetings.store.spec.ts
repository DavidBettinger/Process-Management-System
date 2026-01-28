import { of, throwError } from 'rxjs';
import { MeetingsStore } from './meetings.store';
import { MeetingsApi } from '../../../core/api/meetings.api';
import { HoldMeetingRequest } from '../../../core/models/meeting.model';

describe('MeetingsStore', () => {
  const createApi = (overrides?: Partial<MeetingsApi>): MeetingsApi => {
    return {
      scheduleMeeting: () => of({ id: 'm-1', status: 'SCHEDULED' }),
      holdMeeting: () => of({ meetingId: 'm-1', createdTaskIds: [] }),
      ...overrides
    } as MeetingsApi;
  };

  it('schedules meeting and stores it in list', async () => {
    const store = new MeetingsStore(createApi());
    store.setCaseId('case-1');

    await store.scheduleMeeting({ scheduledAt: '2026-01-01T10:00:00Z', participantIds: ['u-1'] });

    expect(store.meetings().length).toBe(1);
    expect(store.meetings()[0].id).toBe('m-1');
    expect(store.status()).toBe('success');
  });

  it('holds meeting and sets holdResult', async () => {
    const store = new MeetingsStore(createApi());
    store.setCaseId('case-1');

    const req: HoldMeetingRequest = {
      heldAt: '2026-01-01T11:00:00Z',
      participantIds: ['u-1'],
      minutesText: 'Notizen',
      actionItems: []
    };

    await store.holdMeeting('m-1', req);

    expect(store.holdResult()?.meetingId).toBe('m-1');
    expect(store.status()).toBe('success');
  });

  it('sets error when caseId is missing', async () => {
    const store = new MeetingsStore(createApi());

    await store.scheduleMeeting({ scheduledAt: '2026-01-01T10:00:00Z', participantIds: ['u-1'] });

    expect(store.status()).toBe('error');
    expect(store.error()?.code).toBe('MISSING_CASE_ID');
  });

  it('loadMeetings throws TODO when endpoint missing', async () => {
    const store = new MeetingsStore(createApi());
    let caught = false;

    try {
      await store.loadMeetings();
    } catch {
      caught = true;
    }

    expect(caught).toBe(true);
    expect(store.status()).toBe('error');
  });

  it('stores errors on holdMeeting', async () => {
    const store = new MeetingsStore(createApi({
      holdMeeting: () => throwError(() => new Error('Fehler'))
    }));
    store.setCaseId('case-1');

    await store.holdMeeting('m-1', {
      heldAt: '2026-01-01T11:00:00Z',
      participantIds: ['u-1'],
      minutesText: 'Notizen',
      actionItems: []
    });

    expect(store.status()).toBe('error');
    expect(store.error()?.message).toBe('Fehler');
  });
});
