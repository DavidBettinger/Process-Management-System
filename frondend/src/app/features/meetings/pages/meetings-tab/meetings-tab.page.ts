import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MeetingsStore } from '../../state/meetings.store';
import { MeetingHoldFormComponent, HoldMeetingPayload } from '../../components/meeting-hold-form/meeting-hold-form.component';

@Component({
  selector: 'app-meetings-tab-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MeetingHoldFormComponent],
  templateUrl: './meetings-tab.page.html',
  styleUrl: './meetings-tab.page.css'
})
export class MeetingsTabPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  readonly meetingsStore = inject(MeetingsStore);

  readonly meetings = this.meetingsStore.meetings;
  readonly status = this.meetingsStore.status;
  readonly error = this.meetingsStore.error;
  readonly isLoading = this.meetingsStore.isLoading;
  readonly holdResult = this.meetingsStore.holdResult;

  readonly scheduleForm = this.formBuilder.group({
    scheduledAt: ['', [Validators.required]],
    locationId: ['', [Validators.required]],
    participantIds: ['', [Validators.required]]
  });

  ngOnInit(): void {
    const parentRoute = this.route.parent ?? this.route;
    parentRoute.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const caseId = params.get('caseId');
      if (caseId) {
        this.meetingsStore.setCaseId(caseId);
      }
      this.meetingsStore.clearHoldResult();
    });
  }

  async submitSchedule(): Promise<void> {
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }
    const value = this.scheduleForm.getRawValue();
    await this.meetingsStore.scheduleMeeting({
      scheduledAt: toIsoDateTime(value.scheduledAt ?? ''),
      locationId: value.locationId ?? '',
      participantIds: parseIds(value.participantIds ?? '')
    });
    this.scheduleForm.reset({ scheduledAt: '', locationId: '', participantIds: '' });
  }

  async handleHold(payload: HoldMeetingPayload): Promise<void> {
    await this.meetingsStore.holdMeeting(payload.meetingId, payload.request);
  }

  clearHoldResult(): void {
    this.meetingsStore.clearHoldResult();
  }

  meetingStatusLabel(status: string): string {
    if (status === 'SCHEDULED') {
      return 'Geplant';
    }
    if (status === 'HELD') {
      return 'Durchgefuehrt';
    }
    return 'Abgesagt';
  }
}

const parseIds = (input: string): string[] =>
  input
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

const toIsoDateTime = (value: string): string => {
  const date = new Date(value);
  return date.toISOString();
};
