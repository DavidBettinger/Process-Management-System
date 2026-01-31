import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CasesStore } from '../../state/cases.store';
import { CaseCreateDialogComponent } from '../../components/case-create-dialog/case-create-dialog.component';
import { CreateCaseRequest } from '../../../../core/models/case.model';
import { KitasStore } from '../../../kitas/state/kitas.store';
import { LocationsStore } from '../../../locations/state/locations.store';

@Component({
  selector: 'app-case-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink, CaseCreateDialogComponent],
  templateUrl: './case-list.page.html',
  styleUrl: './case-list.page.css'
})
export class CaseListPageComponent implements OnInit {
  readonly casesStore = inject(CasesStore);
  readonly kitasStore = inject(KitasStore);
  readonly locationsStore = inject(LocationsStore);
  private readonly router = inject(Router);

  readonly cases = this.casesStore.cases;
  readonly status = this.casesStore.status;
  readonly error = this.casesStore.error;
  readonly isLoading = this.casesStore.isLoading;
  readonly isEmpty = this.casesStore.isEmpty;
  readonly kitas = this.kitasStore.kitas;
  readonly locations = this.locationsStore.locations;

  ngOnInit(): void {
    void this.casesStore.loadCases();
    void this.kitasStore.loadKitas();
    void this.locationsStore.loadLocations();
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

  kitaLabel(kitaId: string): string {
    const match = this.kitas().find((kita) => kita.id === kitaId);
    return match ? match.name : 'Kita unbekannt';
  }
}
