import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HoldMeetingRequest, HoldMeetingResponse, Meeting } from '../../../../core/models/meeting.model';
import { Location } from '../../../../core/models/location.model';
import { Stakeholder, StakeholderRole } from '../../../../core/models/stakeholder.model';
import { ActionItemDraft, ActionItemsEditorComponent } from '../action-items-editor/action-items-editor.component';
import { isControlInvalid, requiredMessage } from '../../../../shared/forms/form-utils';
import { TwFieldComponent } from '../../../../shared/ui/tw/tw-field.component';
import { TwButtonDirective } from '../../../../shared/ui/tw/tw-button.directive';
import { StakeholderSelectComponent } from '../../../../shared/ui/stakeholder-select/stakeholder-select.component';

export interface HoldMeetingPayload {
  meetingId: string;
  request: HoldMeetingRequest;
}

@Component({
  selector: 'app-meeting-hold-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ActionItemsEditorComponent,
    StakeholderSelectComponent,
    TwFieldComponent,
    TwButtonDirective
  ],
  templateUrl: './meeting-hold-form.component.html'
})
export class MeetingHoldFormComponent implements OnChanges {
  private readonly formBuilder = inject(FormBuilder);
  readonly requiredMessage = requiredMessage;

  @Input() meetings: Meeting[] = [];
  @Input() locations: Location[] = [];
  @Input() stakeholders: Stakeholder[] = [];
  @Input() defaultLocationId: string | null = null;
  @Input() isLoading = false;
  @Input() holdResult: HoldMeetingResponse | null = null;
  @Input() stakeholdersReady = true;
  @Input() stakeholdersError: string | null = null;

  @Output() hold = new EventEmitter<HoldMeetingPayload>();
  @Output() clearResult = new EventEmitter<void>();

  readonly selectedMeetingId = signal<string | null>(null);
  readonly runMode = signal(false);
  readonly showStageA = computed(() => this.selectedMeetingId() !== null && !this.runMode());
  readonly showStageB = computed(() => this.runMode());

  readonly selectedMeeting = computed(() => {
    const meetingId = this.selectedMeetingId();
    if (!meetingId) {
      return null;
    }
    return this.meetings.find((meeting) => meeting.id === meetingId) ?? null;
  });

  readonly form = this.formBuilder.group({
    meetingId: ['', [Validators.required]],
    heldAt: ['', [Validators.required]],
    locationId: ['', [Validators.required]],
    minutesText: ['', [Validators.required]]
  });

  actionItems: ActionItemDraft[] = [];
  actionItemsError: string | null = null;
  participantsError: string | null = null;
  participantIds: string[] = [''];

  submit(): void {
    this.actionItemsError = null;
    this.participantsError = null;
    if (!this.runMode()) {
      return;
    }
    if (this.form.controls.minutesText.invalid || this.form.controls.heldAt.invalid || this.form.controls.locationId.invalid) {
      this.form.controls.minutesText.markAsTouched();
      this.form.controls.heldAt.markAsTouched();
      this.form.controls.locationId.markAsTouched();
      return;
    }
    if (!this.stakeholdersReady) {
      this.participantsError = this.stakeholdersError ?? 'Beteiligte konnten nicht geladen werden.';
      return;
    }
    if (this.actionItems.some((item) => !item.title.trim())) {
      this.actionItemsError = 'Bitte gib fuer jeden Aufgabenpunkt einen Titel an.';
      return;
    }

    const participantIds = this.resolveParticipantIds();
    if (participantIds.length === 0) {
      this.participantsError = 'Teilnehmende fuer den Termin fehlen.';
      return;
    }

    const value = this.form.getRawValue();
    const meetingId = this.selectedMeetingId();
    if (!meetingId) {
      return;
    }
    const request: HoldMeetingRequest = {
      heldAt: toIsoDateTime(value.heldAt ?? ''),
      locationId: value.locationId ?? '',
      participantIds,
      minutesText: value.minutesText ?? '',
      actionItems: this.actionItems.length ? this.actionItems.map((item) => ({
        key: item.key,
        title: item.title.trim(),
        assigneeId: item.assigneeId?.trim() ? item.assigneeId.trim() : null,
        dueDate: item.dueDate ?? null,
        priority: item.priority ?? null,
        description: item.description?.trim() ? item.description.trim() : null
      })) : []
    };

    this.hold.emit({ meetingId, request });
  }

  isInvalid(controlName: string): boolean {
    return isControlInvalid(this.form, controlName);
  }

  updateActionItems(items: ActionItemDraft[]): void {
    this.actionItems = items;
  }

  onMeetingSelectionChange(meetingId: string | null): void {
    this.selectedMeetingId.set(meetingId);
    this.form.controls.meetingId.setValue(meetingId ?? '');
    if (this.participantsError) {
      this.participantsError = null;
    }
    if (!meetingId) {
      this.form.controls.heldAt.setValue('');
      this.form.controls.locationId.setValue(this.defaultLocationId ?? '');
      this.participantIds = [''];
      return;
    }
    this.applyMeetingDefaults(meetingId);
  }

  startRunMode(): void {
    this.actionItemsError = null;
    this.participantsError = null;

    if (!this.selectedMeetingId()) {
      this.form.controls.meetingId.markAsTouched();
      return;
    }

    if (this.form.controls.heldAt.invalid || this.form.controls.locationId.invalid) {
      this.form.controls.heldAt.markAsTouched();
      this.form.controls.locationId.markAsTouched();
      return;
    }

    const participants = this.resolveParticipantIds();
    if (participants.length === 0) {
      this.participantsError = 'Teilnehmende fuer den Termin fehlen.';
      return;
    }

    this.runMode.set(true);
    this.form.controls.minutesText.markAsUntouched();
  }

  cancelRunMode(): void {
    this.resetState();
    this.clearResult.emit();
  }

  clearHoldResult(): void {
    this.clearResult.emit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['defaultLocationId']) {
      const locationControl = this.form.controls.locationId;
      if (!locationControl.value && this.defaultLocationId) {
        locationControl.setValue(this.defaultLocationId);
      }
    }

    if (changes['meetings']) {
      const selectedMeetingId = this.selectedMeetingId();
      if (selectedMeetingId && !this.meetings.some((meeting) => meeting.id === selectedMeetingId)) {
        this.resetState();
      }
    }

    if (changes['holdResult'] && this.holdResult) {
      this.resetState();
    }
  }

  meetingLabel(meeting: Meeting): string {
    const titleLabel = meeting.title?.trim() ? `${meeting.title.trim()} · ` : '';
    const dateLabel = this.formatDate(meeting.scheduledAt ?? meeting.heldAt ?? null);
    return `${titleLabel}${dateLabel}`;
  }

  locationLabel(locationId: string): string {
    const match = this.locations.find((location) => location.id === locationId);
    return match ? match.label : 'Standort unbekannt';
  }

  locationPreviewLabel(): string {
    const meeting = this.selectedMeeting();
    return meeting ? this.locationLabel(meeting.locationId) : 'Standort unbekannt';
  }

  participantLabels(): string[] {
    const participants = this.participantIds.filter((participantId) => participantId.trim().length > 0);
    if (!participants.length) {
      return [];
    }
    return participants.map((participantId) => this.stakeholderLabel(participantId));
  }

  addParticipant(): void {
    this.participantIds = [...this.participantIds, ''];
  }

  removeParticipant(index: number): void {
    this.participantIds = this.participantIds.filter((_, idx) => idx !== index);
    if (this.participantIds.length === 0) {
      this.participantIds = [''];
    }
    if (this.participantsError) {
      this.participantsError = null;
    }
  }

  updateParticipant(index: number, value: string | null): void {
    const next = [...this.participantIds];
    next[index] = value ?? '';
    this.participantIds = next;
    if (this.participantsError) {
      this.participantsError = null;
    }
  }

  private stakeholderLabel(stakeholderId: string): string {
    const stakeholder = this.stakeholders.find((entry) => entry.id === stakeholderId);
    if (!stakeholder) {
      return 'Unbekannt';
    }
    return `${stakeholder.firstName} ${stakeholder.lastName} — ${this.roleLabel(stakeholder.role)}`;
  }

  private roleLabel(role: StakeholderRole): string {
    switch (role) {
      case 'CONSULTANT':
        return 'Beratung';
      case 'DIRECTOR':
        return 'Leitung';
      case 'TEAM_MEMBER':
        return 'Teammitglied';
      case 'SPONSOR':
        return 'Traeger';
      case 'EXTERNAL':
        return 'Extern';
      default:
        return role;
    }
  }

  private applyMeetingDefaults(meetingId: string): void {
    const meeting = this.meetings.find((item) => item.id === meetingId);
    if (!meeting) {
      return;
    }
    this.form.controls.locationId.setValue(meeting.locationId);
    this.form.controls.heldAt.setValue(toDateTimeLocal(meeting.scheduledAt ?? meeting.heldAt ?? null));
    this.form.controls.minutesText.setValue('');
    this.participantIds = meeting.participantIds.length ? [...meeting.participantIds] : [''];
    this.actionItems = [];
  }

  private formatDate(value: string | null): string {
    if (!value) {
      return 'Datum offen';
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return 'Datum offen';
    }
    return parsed.toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });
  }

  private resetState(): void {
    this.runMode.set(false);
    this.selectedMeetingId.set(null);
    this.form.reset({
      meetingId: '',
      heldAt: '',
      locationId: this.defaultLocationId ?? '',
      minutesText: ''
    });
    this.participantIds = [''];
    this.actionItems = [];
    this.actionItemsError = null;
    this.participantsError = null;
  }

  private resolveParticipantIds(): string[] {
    const participants = this.participantIds
      .map((participantId) => participantId.trim())
      .filter((participantId) => participantId.length > 0);
    if (participants.length !== this.participantIds.length) {
      return [];
    }
    return participants;
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
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  const year = parsed.getFullYear();
  const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
  const day = `${parsed.getDate()}`.padStart(2, '0');
  const hours = `${parsed.getHours()}`.padStart(2, '0');
  const minutes = `${parsed.getMinutes()}`.padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
