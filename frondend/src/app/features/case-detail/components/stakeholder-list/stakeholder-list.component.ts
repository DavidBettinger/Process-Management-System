import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RoleInCase, StakeholderResponse } from '../../../../core/models/stakeholder.model';

@Component({
  selector: 'app-stakeholder-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stakeholder-list.component.html',
  styleUrl: './stakeholder-list.component.css'
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
