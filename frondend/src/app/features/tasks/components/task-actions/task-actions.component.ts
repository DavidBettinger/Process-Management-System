import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task, TaskResolutionKind } from '../../../../core/models/task.model';

interface AssignPayload {
  taskId: string;
  assigneeId: string;
}

interface BlockPayload {
  taskId: string;
  reason: string;
}

interface DeclinePayload {
  taskId: string;
  reason: string;
  suggestedAssigneeId?: string | null;
}

interface ResolvePayload {
  taskId: string;
  kind: TaskResolutionKind;
  reason: string;
}

@Component({
  selector: 'app-task-actions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-actions.component.html',
  styleUrl: './task-actions.component.css'
})
export class TaskActionsComponent {
  private readonly formBuilder = inject(FormBuilder);
  @Input({ required: true }) task!: Task;
  @Input() busy = false;

  @Output() assign = new EventEmitter<AssignPayload>();
  @Output() start = new EventEmitter<string>();
  @Output() block = new EventEmitter<BlockPayload>();
  @Output() unblock = new EventEmitter<string>();
  @Output() decline = new EventEmitter<DeclinePayload>();
  @Output() resolve = new EventEmitter<ResolvePayload>();

  readonly assignForm = this.formBuilder.group({
    assigneeId: ['', [Validators.required]]
  });

  readonly blockForm = this.formBuilder.group({
    reason: ['', [Validators.required]]
  });

  readonly declineForm = this.formBuilder.group({
    reason: ['', [Validators.required]],
    suggestedAssigneeId: ['']
  });

  readonly resolveForm = this.formBuilder.group({
    kind: ['COMPLETED' as TaskResolutionKind, [Validators.required]],
    reason: ['', [Validators.required]]
  });

  readonly resolveKinds: { value: TaskResolutionKind; label: string }[] = [
    { value: 'COMPLETED', label: 'Abgeschlossen' },
    { value: 'NOT_COMPLETED', label: 'Nicht abgeschlossen' },
    { value: 'NOT_APPLICABLE', label: 'Nicht anwendbar' },
    { value: 'CANCELLED', label: 'Abgebrochen' }
  ];

  canAssign(): boolean {
    return this.task.state === 'OPEN';
  }

  canStart(): boolean {
    return this.task.state === 'ASSIGNED';
  }

  canBlock(): boolean {
    return this.task.state === 'IN_PROGRESS';
  }

  canUnblock(): boolean {
    return this.task.state === 'BLOCKED';
  }

  canDecline(): boolean {
    return this.task.state === 'ASSIGNED';
  }

  canResolve(): boolean {
    return this.task.state === 'IN_PROGRESS' || this.task.state === 'BLOCKED';
  }

  isResolved(): boolean {
    return this.task.state === 'RESOLVED';
  }

  submitAssign(): void {
    if (!this.canAssign() || this.busy || this.assignForm.invalid) {
      this.assignForm.markAllAsTouched();
      return;
    }
    const value = this.assignForm.getRawValue();
    this.assign.emit({ taskId: this.task.id, assigneeId: value.assigneeId ?? '' });
    this.assignForm.reset({ assigneeId: '' });
  }

  submitStart(): void {
    if (!this.canStart() || this.busy) {
      return;
    }
    this.start.emit(this.task.id);
  }

  submitBlock(): void {
    if (!this.canBlock() || this.busy || this.blockForm.invalid) {
      this.blockForm.markAllAsTouched();
      return;
    }
    const value = this.blockForm.getRawValue();
    this.block.emit({ taskId: this.task.id, reason: value.reason ?? '' });
    this.blockForm.reset({ reason: '' });
  }

  submitUnblock(): void {
    if (!this.canUnblock() || this.busy) {
      return;
    }
    this.unblock.emit(this.task.id);
  }

  submitDecline(): void {
    if (!this.canDecline() || this.busy || this.declineForm.invalid) {
      this.declineForm.markAllAsTouched();
      return;
    }
    const value = this.declineForm.getRawValue();
    this.decline.emit({
      taskId: this.task.id,
      reason: value.reason ?? '',
      suggestedAssigneeId: value.suggestedAssigneeId?.trim() ? value.suggestedAssigneeId.trim() : null
    });
    this.declineForm.reset({ reason: '', suggestedAssigneeId: '' });
  }

  submitResolve(): void {
    if (!this.canResolve() || this.busy || this.resolveForm.invalid) {
      this.resolveForm.markAllAsTouched();
      return;
    }
    const value = this.resolveForm.getRawValue();
    this.resolve.emit({
      taskId: this.task.id,
      kind: value.kind ?? 'COMPLETED',
      reason: value.reason ?? ''
    });
    this.resolveForm.reset({ kind: 'COMPLETED', reason: '' });
  }
}
