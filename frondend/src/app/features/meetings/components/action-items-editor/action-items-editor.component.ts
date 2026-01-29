import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface ActionItemDraft {
  key: string;
  title: string;
  assigneeId: string;
  dueDate: string | null;
}

@Component({
  selector: 'app-action-items-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './action-items-editor.component.html',
  styleUrl: './action-items-editor.component.css'
})
export class ActionItemsEditorComponent {
  @Input() items: ActionItemDraft[] = [];
  @Output() itemsChange = new EventEmitter<ActionItemDraft[]>();

  addItem(): void {
    const next = [...this.items, this.buildItem()];
    this.itemsChange.emit(next);
  }

  removeItem(index: number): void {
    const next = this.items.filter((_, idx) => idx !== index);
    this.itemsChange.emit(next);
  }

  updateField(index: number, field: keyof ActionItemDraft, value: string | null): void {
    const nextValue = field === 'dueDate' ? (value ? value : null) : (value ?? '');
    const next = this.items.map((item, idx) => {
      if (idx !== index) {
        return item;
      }
      return {
        ...item,
        [field]: nextValue
      } as ActionItemDraft;
    });
    this.itemsChange.emit(next);
  }

  trackByKey(_: number, item: ActionItemDraft): string {
    return item.key;
  }

  private buildItem(): ActionItemDraft {
    return {
      key: this.createKey(),
      title: '',
      assigneeId: '',
      dueDate: null
    };
  }

  private createKey(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `key-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
