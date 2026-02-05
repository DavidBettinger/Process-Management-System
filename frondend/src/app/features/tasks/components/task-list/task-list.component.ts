import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { Task, TaskResolutionKind } from '../../../../core/models/task.model';
import { Stakeholder } from '../../../../core/models/stakeholder.model';
import { TaskActionsComponent } from '../task-actions/task-actions.component';
import { StakeholderLabelPipe } from '../../../../shared/labels/stakeholder-label.pipe';
import { TaskAttachmentsComponent } from '../task-attachments/task-attachments.component';
import { TaskRemindersComponent } from '../task-reminders/task-reminders.component';
import { TwBadgeComponent, TwBadgeVariant } from '../../../../shared/ui/tw/tw-badge.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    TaskActionsComponent,
    StakeholderLabelPipe,
    TaskAttachmentsComponent,
    TaskRemindersComponent,
    TwBadgeComponent
  ],
  templateUrl: './task-list.component.html'
})
export class TaskListComponent {
  private lastTaskCount = 0;
  private tasksValue: Task[] = [];

  @Input({ required: true })
  set tasks(value: Task[]) {
    this.tasksValue = value ?? [];
    this.syncExpandedTask();
  }
  get tasks(): Task[] {
    return this.tasksValue;
  }

  @Input() busyTaskIds: Set<string> = new Set();
  @Input() stakeholders: Stakeholder[] = [];
  @Input() stakeholdersReady = true;

  @Output() assign = new EventEmitter<{ taskId: string; assigneeId: string }>();
  @Output() start = new EventEmitter<string>();
  @Output() block = new EventEmitter<{ taskId: string; reason: string }>();
  @Output() unblock = new EventEmitter<string>();
  @Output() decline = new EventEmitter<{ taskId: string; reason: string; suggestedAssigneeId?: string | null }>();
  @Output() resolve = new EventEmitter<{ taskId: string; kind: TaskResolutionKind; reason: string }>();

  readonly expandedTaskId = signal<string | null>(null);

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
    const base = 'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold';
    if (priority === 1) {
      return `${base} border-rose-200 bg-rose-50 text-rose-700`;
    }
    if (priority === 2) {
      return `${base} border-amber-200 bg-amber-50 text-amber-700`;
    }
    if (priority === 3) {
      return `${base} border-sky-200 bg-sky-50 text-sky-700`;
    }
    if (priority === 4) {
      return `${base} border-slate-200 bg-slate-50 text-slate-600`;
    }
    if (priority === 5) {
      return `${base} border-slate-200 bg-slate-100 text-slate-500`;
    }
    return `${base} border-slate-200 bg-slate-50 text-slate-600`;
  }

  statusVariant(state: Task['state']): TwBadgeVariant {
    if (state === 'OPEN') {
      return 'info';
    }
    if (state === 'ASSIGNED') {
      return 'warning';
    }
    if (state === 'IN_PROGRESS') {
      return 'info';
    }
    if (state === 'BLOCKED') {
      return 'danger';
    }
    if (state === 'RESOLVED') {
      return 'success';
    }
    return 'neutral';
  }

  isBusy(taskId: string): boolean {
    return this.busyTaskIds.has(taskId);
  }

  toggleTask(taskId: string): void {
    this.expandedTaskId.update((current) => (current === taskId ? null : taskId));
  }

  isExpanded(taskId: string): boolean {
    return this.expandedTaskId() === taskId;
  }

  private syncExpandedTask(): void {
    const count = this.tasksValue.length;
    if (count === 1) {
      this.expandedTaskId.set(this.tasksValue[0]?.id ?? null);
    } else if (count > 1) {
      if (this.lastTaskCount <= 1) {
        this.expandedTaskId.set(null);
      } else if (this.expandedTaskId()) {
        const stillExists = this.tasksValue.some((task) => task.id === this.expandedTaskId());
        if (!stillExists) {
          this.expandedTaskId.set(null);
        }
      }
    } else {
      this.expandedTaskId.set(null);
    }
    this.lastTaskCount = count;
  }
}
