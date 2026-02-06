import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, TemplateRef, ViewChild, effect, inject } from '@angular/core';
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
import {
  ConfirmDialogService,
  DialogRef,
  TemplateDialogContext
} from '../../../../shared/ui/confirm-dialog/confirm-dialog.service';
import { ToastService } from '../../../../shared/ui/toast.service';

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
  @ViewChild('scheduleDialog') private scheduleDialog?: TemplateRef<TemplateDialogContext>;
  private scheduleDialogRef: DialogRef | null = null;

  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly toastService = inject(ToastService);
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
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(10000)]],
    scheduledAt: ['', [Validators.required]],
    locationId: ['', [Validators.required]]
  });

  scheduleParticipants: string[] = [''];
  scheduleParticipantsError: string | null = null;
  editingMeetingId: string | null = null;
  scheduleDialogTitle = 'Termin planen';

  constructor() {
    effect(() => {
      const defaultLocationId = this.defaultLocationId();
      const locationControl = this.scheduleForm.controls.locationId;
      if (!locationControl.value && defaultLocationId) {
        locationControl.setValue(defaultLocationId, { emitEvent: false });
      }
    });
  }

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

  openScheduleDialog(meetingId: string | null = null): void {
    if (this.scheduleDialogRef || !this.scheduleDialog) {
      return;
    }
    this.editingMeetingId = meetingId;
    this.scheduleDialogTitle = this.isEditingSchedule() ? 'Termin bearbeiten' : 'Termin planen';
    if (meetingId) {
      this.prefillScheduleForm(meetingId);
    }
    const dialogRef = this.confirmDialog.openTemplate({
      title: this.scheduleDialogTitle,
      template: this.scheduleDialog,
      panelClass: 'max-w-2xl'
    });
    this.scheduleDialogRef = dialogRef;
    dialogRef.afterClosed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.scheduleDialogRef === dialogRef) {
        this.scheduleDialogRef = null;
      }
      this.editingMeetingId = null;
      this.scheduleDialogTitle = 'Termin planen';
      this.resetScheduleForm();
    });
  }

  closeScheduleDialog(): void {
    this.scheduleDialogRef?.close();
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
    const request = {
      scheduledAt: toIsoDateTime(value.scheduledAt ?? ''),
      locationId: value.locationId ?? '',
      participantIds,
      title: value.title ?? '',
      description: value.description?.trim() ? value.description.trim() : null
    };
    const save$ = this.isEditingSchedule() && this.editingMeetingId
      ? this.meetingsStore.updateMeeting(this.editingMeetingId, request)
      : this.meetingsStore.scheduleMeeting(request);

    save$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.meetingsStore.status() === 'error') {
          const message = this.meetingsStore.error()?.message ?? 'Termin konnte nicht gespeichert werden.';
          this.toastService.error(message);
          return;
        }
        if (this.isEditingSchedule()) {
          this.toastService.success('Termin wurde aktualisiert.');
        }
        this.closeScheduleDialog();
      });
  }

  isScheduleInvalid(controlName: string): boolean {
    return isControlInvalid(this.scheduleForm, controlName);
  }

  scheduleTitleError(): string | null {
    if (!this.isScheduleInvalid('title')) {
      return null;
    }
    const control = this.scheduleForm.controls.title;
    if (control.hasError('required')) {
      return requiredMessage('Titel');
    }
    if (control.hasError('maxlength')) {
      return 'Maximal 200 Zeichen.';
    }
    return 'Ungueltige Eingabe.';
  }

  scheduleDescriptionError(): string | null {
    if (!this.isScheduleInvalid('description')) {
      return null;
    }
    const control = this.scheduleForm.controls.description;
    if (control.hasError('maxlength')) {
      return 'Maximal 10000 Zeichen.';
    }
    return 'Ungueltige Eingabe.';
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

  isPlannedMeeting(meeting: Meeting): boolean {
    return meeting.status === 'SCHEDULED';
  }

  isEditingSchedule(): boolean {
    return this.editingMeetingId !== null;
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

  private resetScheduleForm(): void {
    this.scheduleForm.reset({ title: '', description: '', scheduledAt: '', locationId: '' });
    this.scheduleParticipants = [''];
    this.scheduleParticipantsError = null;
  }

  private prefillScheduleForm(meetingId: string): void {
    const meeting = this.meetings().find((item) => item.id === meetingId);
    if (!meeting) {
      return;
    }
    this.scheduleForm.reset({
      title: meeting.title ?? '',
      description: meeting.description ?? '',
      scheduledAt: toDateTimeLocal(meeting.scheduledAt ?? meeting.heldAt ?? null),
      locationId: meeting.locationId
    });
    this.scheduleParticipants = meeting.participantIds.length ? [...meeting.participantIds] : [''];
    this.scheduleParticipantsError = null;
  }
}

const toIsoDateTime = (value: string): string => {
  const date = new Date(value);
  return date.toISOString();
};

const toDateTimeLocal = (value: string | null): string => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const pad = (part: number): string => part.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
