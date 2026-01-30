import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HoldMeetingRequest, HoldMeetingResponse, Meeting } from '../../../../core/models/meeting.model';
import { Location } from '../../../../core/models/location.model';
import { Stakeholder } from '../../../../core/models/stakeholder.model';
import { ActionItemDraft, ActionItemsEditorComponent } from '../action-items-editor/action-items-editor.component';
import { RouterLink } from '@angular/router';
import { StakeholderSelectComponent } from '../../../../shared/ui/stakeholder-select/stakeholder-select.component';

export interface HoldMeetingPayload {
  meetingId: string;
  request: HoldMeetingRequest;
}

@Component({
  selector: 'app-meeting-hold-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ActionItemsEditorComponent, RouterLink, StakeholderSelectComponent],
  templateUrl: './meeting-hold-form.component.html',
  styleUrl: './meeting-hold-form.component.css'
})
export class MeetingHoldFormComponent implements OnChanges {
  private readonly formBuilder = inject(FormBuilder);

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

  readonly form = this.formBuilder.group({
    meetingId: ['', [Validators.required]],
    heldAt: ['', [Validators.required]],
    locationId: ['', [Validators.required]],
    minutesText: ['', [Validators.required]]
  });

  actionItems: ActionItemDraft[] = [];
  actionItemsError: string | null = null;
  participantIds: string[] = [''];
  participantsError: string | null = null;

  submit(): void {
    this.actionItemsError = null;
    this.participantsError = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
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
    const participants = this.participantIds.filter(Boolean);
    if (participants.length === 0) {
      this.participantsError = 'Bitte waehle mindestens eine beteiligte Person aus.';
      return;
    }

    const value = this.form.getRawValue();
    const meetingId = value.meetingId ?? '';
    const request: HoldMeetingRequest = {
      heldAt: toIsoDateTime(value.heldAt ?? ''),
      locationId: value.locationId ?? '',
      participantIds: participants,
      minutesText: value.minutesText ?? '',
      actionItems: this.actionItems.length ? this.actionItems.map((item) => ({
        key: item.key,
        title: item.title.trim(),
        assigneeId: item.assigneeId?.trim() ? item.assigneeId.trim() : null,
        dueDate: item.dueDate ?? null
      })) : []
    };

    this.hold.emit({ meetingId, request });
  }

  updateActionItems(items: ActionItemDraft[]): void {
    this.actionItems = items;
  }

  addParticipant(): void {
    this.participantIds = [...this.participantIds, ''];
  }

  removeParticipant(index: number): void {
    this.participantIds = this.participantIds.filter((_, idx) => idx !== index);
  }

  updateParticipant(index: number, value: string | null): void {
    const next = [...this.participantIds];
    next[index] = value ?? '';
    this.participantIds = next;
    if (this.participantsError) {
      this.participantsError = null;
    }
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
  }

  meetingLabel(meeting: Meeting): string {
    const statusLabel = meeting.status === 'SCHEDULED'
      ? 'Geplant'
      : meeting.status === 'HELD'
        ? 'Durchgefuehrt'
        : 'Abgesagt';
    const dateLabel = this.formatDate(meeting.heldAt ?? meeting.scheduledAt ?? null);
    const locationLabel = this.locationLabel(meeting.locationId);
    return `${dateLabel} · ${locationLabel} (${statusLabel})`;
  }

  locationLabel(locationId: string): string {
    const match = this.locations.find((location) => location.id === locationId);
    return match ? match.label : 'Standort unbekannt';
  }

  applyMeetingDefaults(meetingId: string | null): void {
    if (!meetingId) {
      return;
    }
    const meeting = this.meetings.find((item) => item.id === meetingId);
    if (!meeting) {
      return;
    }
    this.form.controls.locationId.setValue(meeting.locationId);
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
}

const toIsoDateTime = (value: string): string => {
  const date = new Date(value);
  return date.toISOString();
};
