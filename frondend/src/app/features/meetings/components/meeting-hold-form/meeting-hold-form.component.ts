import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HoldMeetingRequest, HoldMeetingResponse, Meeting } from '../../../../core/models/meeting.model';
import { Location } from '../../../../core/models/location.model';
import { ActionItemDraft, ActionItemsEditorComponent } from '../action-items-editor/action-items-editor.component';
import { RouterLink } from '@angular/router';

export interface HoldMeetingPayload {
  meetingId: string;
  request: HoldMeetingRequest;
}

@Component({
  selector: 'app-meeting-hold-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ActionItemsEditorComponent, RouterLink],
  templateUrl: './meeting-hold-form.component.html',
  styleUrl: './meeting-hold-form.component.css'
})
export class MeetingHoldFormComponent implements OnChanges {
  private readonly formBuilder = inject(FormBuilder);

  @Input() meetings: Meeting[] = [];
  @Input() locations: Location[] = [];
  @Input() defaultLocationId: string | null = null;
  @Input() isLoading = false;
  @Input() holdResult: HoldMeetingResponse | null = null;

  @Output() hold = new EventEmitter<HoldMeetingPayload>();
  @Output() clearResult = new EventEmitter<void>();

  readonly form = this.formBuilder.group({
    meetingId: ['', [Validators.required]],
    heldAt: ['', [Validators.required]],
    locationId: ['', [Validators.required]],
    participantIds: ['', [Validators.required]],
    minutesText: ['', [Validators.required]]
  });

  actionItems: ActionItemDraft[] = [];
  actionItemsError: string | null = null;

  submit(): void {
    this.actionItemsError = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.actionItems.some((item) => !item.title.trim())) {
      this.actionItemsError = 'Bitte gib fuer jeden Aufgabenpunkt einen Titel an.';
      return;
    }

    const value = this.form.getRawValue();
    const meetingId = value.meetingId ?? '';
    const request: HoldMeetingRequest = {
      heldAt: toIsoDateTime(value.heldAt ?? ''),
      locationId: value.locationId ?? '',
      participantIds: parseIds(value.participantIds ?? ''),
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

const parseIds = (input: string): string[] =>
  input
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

const toIsoDateTime = (value: string): string => {
  const date = new Date(value);
  return date.toISOString();
};
