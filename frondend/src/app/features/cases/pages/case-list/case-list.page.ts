import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CasesStore } from '../../state/cases.store';
import { CaseCreateDialogComponent } from '../../components/case-create-dialog/case-create-dialog.component';
import { CreateCaseRequest } from '../../../../core/models/case.model';

@Component({
  selector: 'app-case-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink, CaseCreateDialogComponent],
  templateUrl: './case-list.page.html',
  styleUrl: './case-list.page.css'
})
export class CaseListPageComponent implements OnInit {
  readonly casesStore = inject(CasesStore);
  private readonly router = inject(Router);

  readonly cases = this.casesStore.cases;
  readonly status = this.casesStore.status;
  readonly error = this.casesStore.error;
  readonly isLoading = this.casesStore.isLoading;
  readonly isEmpty = this.casesStore.isEmpty;

  ngOnInit(): void {
    void this.casesStore.loadCases();
  }

  async handleCreate(request: CreateCaseRequest): Promise<void> {
    await this.casesStore.createCase(request);
    const createdId = this.casesStore.lastCreatedId();
    if (createdId) {
      this.casesStore.clearCreatedId();
      await this.router.navigate(['/cases', createdId]);
    }
  }

  statusLabel(status: string): string {
    if (status === 'ACTIVE') {
      return 'Aktiv';
    }
    if (status === 'DRAFT') {
      return 'Entwurf';
    }
    return 'Unbekannt';
  }
}
