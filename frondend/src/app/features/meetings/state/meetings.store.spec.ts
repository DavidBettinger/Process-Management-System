import { of, throwError } from 'rxjs';
import { MeetingsStore } from './meetings.store';
import { MeetingsApi } from '../../../core/api/meetings.api';
import { HoldMeetingRequest } from '../../../core/models/meeting.model';

describe('MeetingsStore', () => {
  const createApi = (overrides?: Partial<MeetingsApi>): MeetingsApi => {
    return {
      scheduleMeeting: () =>
        of({
          id: 'm-1',
          status: 'SCHEDULED',
          locationId: 'location-1',
          participantIds: ['u-1'],
          title: 'Kickoff',
          description: null
        }),
      getMeetings: () =>
        of({
          items: [
            {
              id: 'm-1',
              status: 'SCHEDULED',
              locationId: 'location-1',
              participantIds: ['u-1'],
              title: 'Kickoff',
              description: null,
              scheduledAt: '2026-01-01T10:00:00Z'
            }
          ]
        }),
      holdMeeting: () => of({ meetingId: 'm-1', createdTaskIds: [] }),
      ...overrides
    } as MeetingsApi;
  };

  it('schedules meeting and stores it in list', () => {
    const store = new MeetingsStore(createApi());
    store.setCaseId('case-1');

    store.scheduleMeeting({
      scheduledAt: '2026-01-01T10:00:00Z',
      locationId: 'location-1',
      participantIds: ['u-1'],
      title: 'Kickoff',
      description: null
    }).subscribe();

    expect(store.meetings().length).toBe(1);
    expect(store.meetings()[0].id).toBe('m-1');
    expect(store.meetings()[0].participantIds).toEqual(['u-1']);
    expect(store.status()).toBe('success');
  });

  it('holds meeting and sets holdResult', () => {
    const store = new MeetingsStore(createApi());
    store.setCaseId('case-1');

    const req: HoldMeetingRequest = {
      heldAt: '2026-01-01T11:00:00Z',
      locationId: 'location-1',
      participantIds: ['u-1'],
      minutesText: 'Notizen',
      actionItems: []
    };

    store.holdMeeting('m-1', req).subscribe();

    expect(store.holdResult()?.meetingId).toBe('m-1');
    expect(store.status()).toBe('success');
  });

  it('sets error when caseId is missing', () => {
    const store = new MeetingsStore(createApi());

    store.scheduleMeeting({
      scheduledAt: '2026-01-01T10:00:00Z',
      locationId: 'location-1',
      participantIds: ['u-1'],
      title: 'Kickoff',
      description: null
    }).subscribe();

    expect(store.status()).toBe('error');
    expect(store.error()?.code).toBe('MISSING_CASE_ID');
  });

  it('loadMeetings stores meetings on success', () => {
    const store = new MeetingsStore(createApi());
    store.setCaseId('case-1');

    store.loadMeetings().subscribe();

    expect(store.status()).toBe('success');
    expect(store.meetings().length).toBe(1);
    expect(store.meetings()[0].id).toBe('m-1');
  });

  it('stores errors on holdMeeting', () => {
    const store = new MeetingsStore(createApi({
      holdMeeting: () => throwError(() => new Error('Fehler'))
    }));
    store.setCaseId('case-1');

    store.holdMeeting('m-1', {
      heldAt: '2026-01-01T11:00:00Z',
      locationId: 'location-1',
      participantIds: ['u-1'],
      minutesText: 'Notizen',
      actionItems: []
    }).subscribe();

    expect(store.status()).toBe('error');
    expect(store.error()?.message).toBe('Fehler');
  });
});
