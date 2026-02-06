import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Stakeholder, StakeholderRole } from '../../../core/models/stakeholder.model';

@Component({
  selector: 'app-stakeholder-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stakeholder-select.component.html'
})
export class StakeholderSelectComponent {
  @Input() stakeholders: Stakeholder[] = [];
  @Input() selectedId: string | null = null;
  @Input() disabled = false;
  @Input() required = false;
  @Input() placeholder = 'Bitte waehlen';
  @Input() selectId?: string;

  @Output() selectedIdChange = new EventEmitter<string | null>();

  get selectedValue(): string {
    if (!this.selectedId) {
      return '';
    }
    const exists = this.stakeholders.some((stakeholder) => stakeholder.id === this.selectedId);
    return exists ? this.selectedId : '';
  }

  onSelectionChange(event: Event): void {
    const target = event.target as HTMLSelectElement | null;
    if (!target) {
      return;
    }
    const value = target.value;
    this.selectedIdChange.emit(value ? value : null);
  }

  labelFor(stakeholder: Stakeholder): string {
    return `${stakeholder.firstName} ${stakeholder.lastName} — ${this.roleLabel(stakeholder.role)}`;
  }

  private roleLabel(role: StakeholderRole): string {
    switch (role) {
      case 'CONSULTANT':
        return 'Beratung';
      case 'DIRECTOR':
        return 'Leitung';
      case 'TEAM_MEMBER':
        return 'Teammitglied';
      case 'SPONSOR':
        return 'Traeger';
      case 'EXTERNAL':
        return 'Extern';
      default:
        return role;
    }
  }
}
