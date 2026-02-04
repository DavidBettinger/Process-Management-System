import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  HoldMeetingRequest,
  HoldMeetingResponse,
  MeetingsResponse,
  ScheduleMeetingRequest,
  ScheduleMeetingResponse
} from '../models/meeting.model';
import { buildApiUrl } from './api.config';

@Injectable({ providedIn: 'root' })
export class MeetingsApi {
  constructor(private readonly http: HttpClient) {}

  scheduleMeeting(caseId: string, request: ScheduleMeetingRequest): Observable<ScheduleMeetingResponse> {
    return this.http.post<ScheduleMeetingResponse>(buildApiUrl(`/cases/${caseId}/meetings`), request);
  }

  getMeetings(caseId: string): Observable<MeetingsResponse> {
    return this.http.get<MeetingsResponse>(buildApiUrl(`/cases/${caseId}/meetings`));
  }

  holdMeeting(
    caseId: string,
    meetingId: string,
    request: HoldMeetingRequest
  ): Observable<HoldMeetingResponse> {
    return this.http.post<HoldMeetingResponse>(
      buildApiUrl(`/cases/${caseId}/meetings/${meetingId}/hold`),
      request
    );
  }
}
