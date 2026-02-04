import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task, TaskResolutionKind } from '../../../../core/models/task.model';
import { Stakeholder } from '../../../../core/models/stakeholder.model';
import { TaskActionsComponent } from '../task-actions/task-actions.component';
import { StakeholderLabelPipe } from '../../../../shared/labels/stakeholder-label.pipe';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskActionsComponent, StakeholderLabelPipe],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent {
  @Input({ required: true }) tasks: Task[] = [];
  @Input() busyTaskIds: Set<string> = new Set();
  @Input() stakeholders: Stakeholder[] = [];
  @Input() stakeholdersReady = true;

  @Output() assign = new EventEmitter<{ taskId: string; assigneeId: string }>();
  @Output() start = new EventEmitter<string>();
  @Output() block = new EventEmitter<{ taskId: string; reason: string }>();
  @Output() unblock = new EventEmitter<string>();
  @Output() decline = new EventEmitter<{ taskId: string; reason: string; suggestedAssigneeId?: string | null }>();
  @Output() resolve = new EventEmitter<{ taskId: string; kind: TaskResolutionKind; reason: string }>();

  statusLabel(state: Task['state']): string {
    if (state === 'OPEN') {
      return 'Offen';
    }
    if (state === 'ASSIGNED') {
      return 'Zugewiesen';
    }
    if (state === 'IN_PROGRESS') {
      return 'In Arbeit';
    }
    if (state === 'BLOCKED') {
      return 'Blockiert';
    }
    if (state === 'RESOLVED') {
      return 'Abgeschlossen';
    }
    return 'Unbekannt';
  }

  priorityLabel(priority: number): string {
    if (priority === 1) {
      return 'Sehr wichtig';
    }
    if (priority === 2) {
      return 'Wichtig';
    }
    if (priority === 3) {
      return 'Mittel';
    }
    if (priority === 4) {
      return 'Eher unwichtig';
    }
    if (priority === 5) {
      return 'Nicht wichtig';
    }
    return 'Unbekannt';
  }

  priorityClass(priority: number): string {
    if (priority >= 1 && priority <= 5) {
      return `priority-${priority}`;
    }
    return '';
  }

  isBusy(taskId: string): boolean {
    return this.busyTaskIds.has(taskId);
  }
}
