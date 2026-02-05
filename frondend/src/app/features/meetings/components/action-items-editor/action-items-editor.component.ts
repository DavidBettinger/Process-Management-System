import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CreateTaskRequest } from '../../../../core/models/task.model';
import { Stakeholder } from '../../../../core/models/stakeholder.model';
import { TaskCreateFormComponent } from '../../../tasks/components/task-create-form/task-create-form.component';
import { StakeholderSelectComponent } from '../../../../shared/ui/stakeholder-select/stakeholder-select.component';
import { TwCardComponent } from '../../../../shared/ui/tw/tw-card.component';
import { TwFieldComponent } from '../../../../shared/ui/tw/tw-field.component';
import { TwButtonDirective } from '../../../../shared/ui/tw/tw-button.directive';

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
  imports: [CommonModule, TaskCreateFormComponent, StakeholderSelectComponent, TwCardComponent, TwFieldComponent, TwButtonDirective],
  templateUrl: './action-items-editor.component.html'
})
export class ActionItemsEditorComponent {
  @Input() items: ActionItemDraft[] = [];
  @Input() stakeholders: Stakeholder[] = [];
  @Output() itemsChange = new EventEmitter<ActionItemDraft[]>();

  removeItem(index: number): void {
    const next = this.items.filter((_, idx) => idx !== index);
    this.itemsChange.emit(next);
  }

  selectedAssigneeId: string | null = null;

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
        assigneeId: this.selectedAssigneeId ?? null,
        dueDate: request.dueDate ?? null,
        priority: request.priority,
        description
      }
    ];
    this.itemsChange.emit(next);
    this.selectedAssigneeId = null;
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
