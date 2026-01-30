import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Stakeholder, StakeholderRole } from '../../../../core/models/stakeholder.model';

@Component({
  selector: 'app-stakeholder-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stakeholder-list.component.html',
  styleUrl: './stakeholder-list.component.css'
})
export class StakeholderListComponent {
  @Input() stakeholders: Stakeholder[] = [];

  roleLabel(role: StakeholderRole): string {
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
