import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MeetingsApi } from './meetings.api';
import { HoldMeetingRequest, ScheduleMeetingRequest } from '../models/meeting.model';

describe('MeetingsApi', () => {
  let api: MeetingsApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    api = TestBed.inject(MeetingsApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('schedules a meeting', () => {
    const payload: ScheduleMeetingRequest = {
      scheduledAt: '2026-01-02T09:00:00Z',
      participantIds: ['u-1']
    };

    api.scheduleMeeting('case-1', payload).subscribe();

    const req = httpMock.expectOne('/api/cases/case-1/meetings');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'm-1', status: 'SCHEDULED' });
  });

  it('holds a meeting', () => {
    const payload: HoldMeetingRequest = {
      heldAt: '2026-01-02T10:00:00Z',
      participantIds: ['u-1'],
      minutesText: 'Notizen',
      actionItems: []
    };

    api.holdMeeting('case-1', 'm-1', payload).subscribe();

    const req = httpMock.expectOne('/api/cases/case-1/meetings/m-1/hold');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ meetingId: 'm-1', createdTaskIds: [] });
  });
});
