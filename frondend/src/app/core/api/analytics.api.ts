import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimelineResponse } from '../models/timeline.model';
import { buildApiUrl } from './api.config';

@Injectable({ providedIn: 'root' })
export class AnalyticsApi {
  constructor(private readonly http: HttpClient) {}

  getTimeline(caseId: string): Observable<TimelineResponse> {
    return this.http.get<TimelineResponse>(buildApiUrl(`/cases/${caseId}/timeline`));
  }
}
