import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TimelineEntry } from '../../../../core/models/timeline.model';
import { MeetingLabelPipe } from '../../../../shared/labels/meeting-label.pipe';
import { StakeholderLabelPipe } from '../../../../shared/labels/stakeholder-label.pipe';
import { TaskLabelPipe } from '../../../../shared/labels/task-label.pipe';

@Component({
  selector: 'app-timeline-list',
  standalone: true,
  imports: [CommonModule, MeetingLabelPipe, TaskLabelPipe, StakeholderLabelPipe],
  templateUrl: './timeline-list.component.html'
})
export class TimelineListComponent {
  @Input() entries: TimelineEntry[] = [];

  titleFor(entry: TimelineEntry): string {
    switch (entry.type) {
      case 'MEETING_HELD':
        return 'Termin durchgefuehrt';
      case 'TASK_CREATED':
        return 'Aufgabe erstellt';
      case 'TASK_ASSIGNED':
        return 'Aufgabe zugewiesen';
      case 'TASK_RESOLVED':
        return 'Aufgabe abgeschlossen';
      default:
        return 'Aktivitaet';
    }
  }

  dateLabel(value: string): string {
    return formatDate(value);
  }
}

const formatDate = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Datum offen';
  }
  return parsed.toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });
};
