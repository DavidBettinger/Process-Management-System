import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, effect, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MeetingsStore } from '../../state/meetings.store';
import { MeetingHoldFormComponent, HoldMeetingPayload } from '../../components/meeting-hold-form/meeting-hold-form.component';
import { LocationsStore } from '../../../locations/state/locations.store';
import { KitasStore } from '../../../kitas/state/kitas.store';
import { CaseDetailStore } from '../../../case-detail/state/case-detail.store';
import { Meeting } from '../../../../core/models/meeting.model';

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
  readonly locationsStore = inject(LocationsStore);
  readonly kitasStore = inject(KitasStore);
  readonly caseStore = inject(CaseDetailStore);

  readonly meetings = this.meetingsStore.meetings;
  readonly status = this.meetingsStore.status;
  readonly error = this.meetingsStore.error;
  readonly isLoading = this.meetingsStore.isLoading;
  readonly holdResult = this.meetingsStore.holdResult;
  readonly locations = this.locationsStore.locations;
  readonly locationsStatus = this.locationsStore.status;
  readonly locationsError = this.locationsStore.error;

  readonly scheduleForm = this.formBuilder.group({
    scheduledAt: ['', [Validators.required]],
    locationId: ['', [Validators.required]],
    participantIds: ['', [Validators.required]]
  });

  private readonly defaultLocationEffect = effect(() => {
    const defaultLocationId = this.defaultLocationId();
    const locationControl = this.scheduleForm.controls.locationId;
    if (!locationControl.value && defaultLocationId) {
      locationControl.setValue(defaultLocationId, { emitEvent: false });
    }
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
    void this.locationsStore.loadLocations();
    void this.kitasStore.loadKitas();
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

  meetingDateLabel(meeting: Meeting): string {
    const dateValue = meeting.heldAt ?? meeting.scheduledAt ?? null;
    if (!dateValue) {
      return 'Datum offen';
    }
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) {
      return 'Datum offen';
    }
    return parsed.toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });
  }

  locationLabel(locationId: string): string {
    const match = this.locations().find((location) => location.id === locationId);
    return match ? match.label : 'Standort unbekannt';
  }

  retryLocations(): void {
    void this.locationsStore.loadLocations();
  }

  defaultLocationId(): string | null {
    const caseData = this.caseStore.caseData();
    if (!caseData?.kitaId) {
      return null;
    }
    const kita = this.kitasStore.kitas().find((item) => item.id === caseData.kitaId);
    return kita?.locationId ?? null;
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
