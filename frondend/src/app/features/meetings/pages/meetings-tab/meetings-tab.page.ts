import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, effect, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MeetingsStore } from '../../state/meetings.store';
import { MeetingHoldFormComponent, HoldMeetingPayload } from '../../components/meeting-hold-form/meeting-hold-form.component';
import { StakeholderSelectComponent } from '../../../../shared/ui/stakeholder-select/stakeholder-select.component';
import { LocationsStore } from '../../../locations/state/locations.store';
import { KitasStore } from '../../../kitas/state/kitas.store';
import { CaseDetailStore } from '../../../case-detail/state/case-detail.store';
import { Meeting } from '../../../../core/models/meeting.model';
import { StakeholdersStore } from '../../../stakeholders/state/stakeholders.store';
import { TwCardComponent } from '../../../../shared/ui/tw/tw-card.component';
import { TwFieldComponent } from '../../../../shared/ui/tw/tw-field.component';
import { TwBadgeComponent } from '../../../../shared/ui/tw/tw-badge.component';
import { TwButtonDirective } from '../../../../shared/ui/tw/tw-button.directive';
import { isControlInvalid, requiredMessage } from '../../../../shared/forms/form-utils';

@Component({
  selector: 'app-meetings-tab-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MeetingHoldFormComponent,
    StakeholderSelectComponent,
    TwCardComponent,
    TwFieldComponent,
    TwBadgeComponent,
    TwButtonDirective
  ],
  templateUrl: './meetings-tab.page.html'
})
export class MeetingsTabPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  readonly meetingsStore = inject(MeetingsStore);
  readonly locationsStore = inject(LocationsStore);
  readonly kitasStore = inject(KitasStore);
  readonly caseStore = inject(CaseDetailStore);
  readonly stakeholdersStore = inject(StakeholdersStore);

  readonly meetings = this.meetingsStore.meetings;
  readonly status = this.meetingsStore.status;
  readonly error = this.meetingsStore.error;
  readonly isLoading = this.meetingsStore.isLoading;
  readonly holdResult = this.meetingsStore.holdResult;
  readonly locations = this.locationsStore.locations;
  readonly locationsStatus = this.locationsStore.status;
  readonly locationsError = this.locationsStore.error;
  readonly stakeholders = this.stakeholdersStore.stakeholders;
  readonly stakeholdersStatus = this.stakeholdersStore.status;
  readonly stakeholdersError = this.stakeholdersStore.error;
  readonly requiredMessage = requiredMessage;

  readonly scheduleForm = this.formBuilder.group({
    scheduledAt: ['', [Validators.required]],
    locationId: ['', [Validators.required]]
  });

  scheduleParticipants: string[] = [''];
  scheduleParticipantsError: string | null = null;

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
        this.meetingsStore.loadMeetings().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
      }
      this.meetingsStore.clearHoldResult();
    });
    this.locationsStore.loadLocations().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.kitasStore.loadKitas().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.stakeholdersStore.loadStakeholders().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  submitSchedule(): void {
    this.scheduleParticipantsError = null;
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }
    if (this.stakeholdersStatus() !== 'success') {
      this.scheduleParticipantsError = this.stakeholdersError()?.message ?? 'Beteiligte konnten nicht geladen werden.';
      return;
    }
    const participantIds = this.scheduleParticipants.filter(Boolean);
    if (participantIds.length === 0) {
      this.scheduleParticipantsError = 'Bitte waehle mindestens eine beteiligte Person aus.';
      return;
    }
    const value = this.scheduleForm.getRawValue();
    this.meetingsStore
      .scheduleMeeting({
        scheduledAt: toIsoDateTime(value.scheduledAt ?? ''),
        locationId: value.locationId ?? '',
        participantIds
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.meetingsStore.status() !== 'error') {
          this.scheduleForm.reset({ scheduledAt: '', locationId: '' });
          this.scheduleParticipants = [''];
        }
      });
  }

  isScheduleInvalid(controlName: string): boolean {
    return isControlInvalid(this.scheduleForm, controlName);
  }

  handleHold(payload: HoldMeetingPayload): void {
    this.meetingsStore
      .holdMeeting(payload.meetingId, payload.request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
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

  addScheduleParticipant(): void {
    this.scheduleParticipants = [...this.scheduleParticipants, ''];
  }

  removeScheduleParticipant(index: number): void {
    this.scheduleParticipants = this.scheduleParticipants.filter((_, idx) => idx !== index);
  }

  updateScheduleParticipant(index: number, value: string | null): void {
    const next = [...this.scheduleParticipants];
    next[index] = value ?? '';
    this.scheduleParticipants = next;
    if (this.scheduleParticipantsError) {
      this.scheduleParticipantsError = null;
    }
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

const toIsoDateTime = (value: string): string => {
  const date = new Date(value);
  return date.toISOString();
};
