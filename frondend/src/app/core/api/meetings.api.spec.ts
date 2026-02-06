import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MeetingsApi } from './meetings.api';
import { HoldMeetingRequest, ScheduleMeetingRequest, UpdateMeetingRequest } from '../models/meeting.model';

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
      locationId: 'location-1',
      participantIds: ['u-1'],
      title: 'Kickoff',
      description: 'Beschreibung'
    };

    api.scheduleMeeting('case-1', payload).subscribe();

    const req = httpMock.expectOne('/api/cases/case-1/meetings');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({
      id: 'm-1',
      status: 'SCHEDULED',
      locationId: 'location-1',
      participantIds: ['u-1'],
      title: 'Kickoff',
      description: 'Beschreibung'
    });
  });

  it('holds a meeting', () => {
    const payload: HoldMeetingRequest = {
      heldAt: '2026-01-02T10:00:00Z',
      locationId: 'location-1',
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

  it('gets meetings for a case', () => {
    api.getMeetings('case-1').subscribe();

    const req = httpMock.expectOne('/api/cases/case-1/meetings');
    expect(req.request.method).toBe('GET');
    req.flush({
      items: [
        {
          id: 'm-1',
          status: 'SCHEDULED',
          locationId: 'location-1',
          participantIds: ['u-1'],
          title: 'Kickoff',
          description: 'Beschreibung',
          scheduledAt: '2026-01-02T09:00:00Z'
        }
      ]
    });
  });

  it('updates a meeting', () => {
    const payload: UpdateMeetingRequest = {
      scheduledAt: '2026-01-03T09:00:00Z',
      locationId: 'location-1',
      participantIds: ['u-1', 'u-2'],
      title: 'Kickoff aktualisiert',
      description: 'Neue Agenda'
    };

    api.updateMeeting('case-1', 'm-1', payload).subscribe();

    const req = httpMock.expectOne('/api/cases/case-1/meetings/m-1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({
      id: 'm-1',
      status: 'SCHEDULED',
      locationId: 'location-1',
      participantIds: ['u-1', 'u-2'],
      title: 'Kickoff aktualisiert',
      description: 'Neue Agenda',
      scheduledAt: '2026-01-03T09:00:00Z'
    });
  });
});
