import { computed, Injectable, signal } from '@angular/core';
import { Observable, defer, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { MeetingsApi } from '../../../core/api/meetings.api';
import {
  HoldMeetingRequest,
  HoldMeetingResponse,
  Meeting,
  ScheduleMeetingRequest
} from '../../../core/models/meeting.model';
import { initialListState, ListState, StoreError, toStoreError } from '../../../core/state/state.types';

@Injectable({ providedIn: 'root' })
export class MeetingsStore {
  readonly caseId = signal<string | null>(null);
  readonly meetingsState = signal<ListState<Meeting>>(initialListState());
  readonly holdResult = signal<HoldMeetingResponse | null>(null);

  readonly meetings = computed(() => this.meetingsState().items);
  readonly status = computed(() => this.meetingsState().status);
  readonly error = computed(() => this.meetingsState().error);
  readonly isLoading = computed(() => this.meetingsState().status === 'loading');

  constructor(private readonly meetingsApi: MeetingsApi) {}

  setCaseId(caseId: string): void {
    this.caseId.set(caseId);
  }

  loadMeetings(): Observable<void> {
    return defer(() => {
      // TODO: Implement GET meetings for case once backend provides an endpoint.
      const error = new Error('TODO: Implement GET meetings for case');
      this.meetingsState.update((current) => ({
        ...current,
        status: 'error',
        error: toStoreError(error)
      }));
      return throwError(() => error);
    });
  }

  scheduleMeeting(req: ScheduleMeetingRequest): Observable<void> {
    return defer(() => {
      const caseId = this.caseId();
      if (!caseId) {
        this.meetingsState.update((current) => ({ ...current, status: 'error', error: missingCaseIdError() }));
        return of(void 0);
      }
      this.meetingsState.update((current) => ({ ...current, status: 'loading', error: undefined }));
      return this.meetingsApi.scheduleMeeting(caseId, req).pipe(
        tap((meeting) => {
          const meetingWithSchedule = { ...meeting, scheduledAt: req.scheduledAt };
          this.meetingsState.update((current) => ({
            ...current,
            status: 'success',
            items: [meetingWithSchedule, ...current.items]
          }));
        }),
        map(() => void 0),
        catchError((error) => {
          this.meetingsState.update((current) => ({ ...current, status: 'error', error: toStoreError(error) }));
          return of(void 0);
        })
      );
    });
  }

  holdMeeting(meetingId: string, req: HoldMeetingRequest): Observable<void> {
    return defer(() => {
      const caseId = this.caseId();
      if (!caseId) {
        this.meetingsState.update((current) => ({ ...current, status: 'error', error: missingCaseIdError() }));
        return of(void 0);
      }
      this.meetingsState.update((current) => ({ ...current, status: 'loading', error: undefined }));
      return this.meetingsApi.holdMeeting(caseId, meetingId, req).pipe(
        tap((result) => {
          this.holdResult.set(result);
          this.meetingsState.update((current) => ({ ...current, status: 'success' }));
        }),
        map(() => void 0),
        catchError((error) => {
          this.meetingsState.update((current) => ({ ...current, status: 'error', error: toStoreError(error) }));
          return of(void 0);
        })
      );
    });
  }

  clearHoldResult(): void {
    this.holdResult.set(null);
  }
}

const missingCaseIdError = (): StoreError => ({
  code: 'MISSING_CASE_ID',
  message: 'Prozess-ID fehlt'
});
