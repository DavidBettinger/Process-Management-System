import { computed, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
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

  async loadMeetings(): Promise<void> {
    // TODO: Implement GET meetings for case once backend provides an endpoint.
    const error = new Error('TODO: Implement GET meetings for case');
    this.meetingsState.update((current) => ({
      ...current,
      status: 'error',
      error: toStoreError(error)
    }));
    throw error;
  }

  async scheduleMeeting(req: ScheduleMeetingRequest): Promise<void> {
    const caseId = this.caseId();
    if (!caseId) {
      this.meetingsState.update((current) => ({ ...current, status: 'error', error: missingCaseIdError() }));
      return;
    }
    this.meetingsState.update((current) => ({ ...current, status: 'loading', error: undefined }));
    try {
      const meeting = await firstValueFrom(this.meetingsApi.scheduleMeeting(caseId, req));
      const meetingWithSchedule = { ...meeting, scheduledAt: req.scheduledAt };
      this.meetingsState.update((current) => ({
        ...current,
        status: 'success',
        items: [meetingWithSchedule, ...current.items]
      }));
    } catch (error) {
      this.meetingsState.update((current) => ({ ...current, status: 'error', error: toStoreError(error) }));
    }
  }

  async holdMeeting(meetingId: string, req: HoldMeetingRequest): Promise<void> {
    const caseId = this.caseId();
    if (!caseId) {
      this.meetingsState.update((current) => ({ ...current, status: 'error', error: missingCaseIdError() }));
      return;
    }
    this.meetingsState.update((current) => ({ ...current, status: 'loading', error: undefined }));
    try {
      const result = await firstValueFrom(this.meetingsApi.holdMeeting(caseId, meetingId, req));
      this.holdResult.set(result);
      this.meetingsState.update((current) => ({ ...current, status: 'success' }));
    } catch (error) {
      this.meetingsState.update((current) => ({ ...current, status: 'error', error: toStoreError(error) }));
    }
  }

  clearHoldResult(): void {
    this.holdResult.set(null);
  }
}

const missingCaseIdError = (): StoreError => ({
  code: 'MISSING_CASE_ID',
  message: 'Prozess-ID fehlt'
});
