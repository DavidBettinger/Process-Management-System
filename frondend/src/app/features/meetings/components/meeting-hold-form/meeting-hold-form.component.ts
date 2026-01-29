import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HoldMeetingRequest, HoldMeetingResponse, Meeting } from '../../../../core/models/meeting.model';
import { ActionItemDraft, ActionItemsEditorComponent } from '../action-items-editor/action-items-editor.component';

export interface HoldMeetingPayload {
  meetingId: string;
  request: HoldMeetingRequest;
}

@Component({
  selector: 'app-meeting-hold-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ActionItemsEditorComponent],
  templateUrl: './meeting-hold-form.component.html',
  styleUrl: './meeting-hold-form.component.css'
})
export class MeetingHoldFormComponent {
  private readonly formBuilder = inject(FormBuilder);

  @Input() meetings: Meeting[] = [];
  @Input() isLoading = false;
  @Input() holdResult: HoldMeetingResponse | null = null;

  @Output() hold = new EventEmitter<HoldMeetingPayload>();
  @Output() clearResult = new EventEmitter<void>();

  readonly form = this.formBuilder.group({
    meetingId: ['', [Validators.required]],
    heldAt: ['', [Validators.required]],
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
      this.actionItemsError = 'Bitte gib fuer jedes Action Item einen Titel an.';
      return;
    }

    const value = this.form.getRawValue();
    const meetingId = value.meetingId ?? '';
    const request: HoldMeetingRequest = {
      heldAt: toIsoDateTime(value.heldAt ?? ''),
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

  meetingLabel(meeting: Meeting): string {
    const statusLabel = meeting.status === 'SCHEDULED' ? 'Geplant' : meeting.status === 'HELD' ? 'Durchgefuehrt' : 'Abgesagt';
    return `${meeting.id} (${statusLabel})`;
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
