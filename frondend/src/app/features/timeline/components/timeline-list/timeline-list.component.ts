import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TimelineEntry, TimelineEntryType } from '../../../../core/models/timeline.model';

@Component({
  selector: 'app-timeline-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline-list.component.html',
  styleUrl: './timeline-list.component.css'
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

  metaFor(entry: TimelineEntry): string {
    const date = formatDate(entry.occurredAt);
    switch (entry.type) {
      case 'MEETING_HELD':
        return `${date} • Termin-ID: ${entry.meetingId ?? 'unbekannt'}`;
      case 'TASK_CREATED':
        return `${date} • Aufgabe-ID: ${entry.taskId ?? 'unbekannt'}`;
      case 'TASK_ASSIGNED':
        return `${date} • Aufgabe-ID: ${entry.taskId ?? 'unbekannt'} • Zugewiesen an ${entry.assigneeId ?? 'unbekannt'}`;
      case 'TASK_RESOLVED':
        return `${date} • Aufgabe-ID: ${entry.taskId ?? 'unbekannt'}`;
      default:
        return `${date} • Typ: ${entry.type as TimelineEntryType}`;
    }
  }
}

const formatDate = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Datum offen';
  }
  return parsed.toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });
};
