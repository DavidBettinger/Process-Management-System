import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Input, Output, TemplateRef, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CreateTaskRequest } from '../../../../core/models/task.model';
import { Stakeholder } from '../../../../core/models/stakeholder.model';
import { TaskCreateFormComponent } from '../../../tasks/components/task-create-form/task-create-form.component';
import { TwButtonDirective } from '../../../../shared/ui/tw/tw-button.directive';
import {
  ConfirmDialogService,
  DialogRef,
  TemplateDialogContext
} from '../../../../shared/ui/confirm-dialog/confirm-dialog.service';

export interface ActionItemDraft {
  key: string;
  title: string;
  assigneeId?: string | null;
  dueDate: string | null;
  priority?: number | null;
  description?: string | null;
}

@Component({
  selector: 'app-action-items-editor',
  standalone: true,
  imports: [CommonModule, TaskCreateFormComponent, TwButtonDirective],
  templateUrl: './action-items-editor.component.html'
})
export class ActionItemsEditorComponent {
  @ViewChild('actionItemDialog') private actionItemDialog?: TemplateRef<TemplateDialogContext>;

  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private actionItemDialogRef: DialogRef | null = null;

  @Input() items: ActionItemDraft[] = [];
  @Input() stakeholders: Stakeholder[] = [];
  @Output() itemsChange = new EventEmitter<ActionItemDraft[]>();

  openCreateDialog(): void {
    if (this.actionItemDialogRef || !this.actionItemDialog) {
      return;
    }
    const dialogRef = this.confirmDialog.openTemplate({
      title: 'Aufgabenpunkt hinzufuegen',
      template: this.actionItemDialog,
      panelClass: 'max-w-2xl'
    });
    this.actionItemDialogRef = dialogRef;
    dialogRef.afterClosed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.actionItemDialogRef === dialogRef) {
        this.actionItemDialogRef = null;
      }
    });
  }

  closeCreateDialog(): void {
    this.actionItemDialogRef?.close();
  }

  handleCreate(request: CreateTaskRequest): void {
    const title = request.title.trim();
    if (!title) {
      return;
    }
    const description = request.description?.trim() ? request.description.trim() : null;
    const next = [
      ...this.items,
      {
        key: this.createKey(),
        title,
        assigneeId: request.assigneeId ?? null,
        dueDate: request.dueDate ?? null,
        priority: request.priority,
        description
      }
    ];
    this.itemsChange.emit(next);
    this.closeCreateDialog();
  }

  removeItem(index: number): void {
    const next = this.items.filter((_, idx) => idx !== index);
    this.itemsChange.emit(next);
  }

  trackByKey(_: number, item: ActionItemDraft): string {
    return item.key;
  }

  assigneeLabel(assigneeId?: string | null): string {
    if (!assigneeId) {
      return 'Unbekannt';
    }
    const match = this.stakeholders.find((stakeholder) => stakeholder.id === assigneeId);
    if (!match) {
      return 'Unbekannt';
    }
    return `${match.firstName} ${match.lastName}`;
  }

  priorityLabel(priority?: number | null): string {
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

  formatDate(value: string | null): string {
    if (!value) {
      return 'Kein Datum';
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return 'Kein Datum';
    }
    return parsed.toLocaleDateString('de-DE');
  }

  private createKey(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `key-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
