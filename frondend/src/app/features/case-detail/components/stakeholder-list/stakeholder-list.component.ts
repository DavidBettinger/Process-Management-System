import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RoleInCase, StakeholderResponse } from '../../../../core/models/stakeholder.model';
import { StakeholderLabelPipe } from '../../../../shared/labels/stakeholder-label.pipe';

@Component({
  selector: 'app-stakeholder-list',
  standalone: true,
  imports: [CommonModule, StakeholderLabelPipe],
  templateUrl: './stakeholder-list.component.html'
})
export class StakeholderListComponent {
  @Input({ required: true }) stakeholders: StakeholderResponse[] = [];

  roleLabel(role: RoleInCase): string {
    if (role === 'CONSULTANT') {
      return 'Fachberatung';
    }
    if (role === 'DIRECTOR') {
      return 'Leitung';
    }
    if (role === 'TEAM_MEMBER') {
      return 'Teammitglied';
    }
    return 'Unbekannt';
  }
}
