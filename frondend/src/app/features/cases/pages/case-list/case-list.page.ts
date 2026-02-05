import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';
import { CasesStore } from '../../state/cases.store';
import { CaseCreateDialogComponent } from '../../components/case-create-dialog/case-create-dialog.component';
import { CreateCaseRequest } from '../../../../core/models/case.model';
import { KitasStore } from '../../../kitas/state/kitas.store';
import { LocationsStore } from '../../../locations/state/locations.store';
import { ToastService } from '../../../../shared/ui/toast.service';
import { TwBadgeComponent, TwBadgeVariant } from '../../../../shared/ui/tw/tw-badge.component';
import { TwButtonDirective } from '../../../../shared/ui/tw/tw-button.directive';
import { TwCardComponent } from '../../../../shared/ui/tw/tw-card.component';

@Component({
  selector: 'app-case-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CaseCreateDialogComponent,
    TwBadgeComponent,
    TwButtonDirective,
    TwCardComponent
  ],
  templateUrl: './case-list.page.html'
})
export class CaseListPageComponent implements OnInit {
  readonly casesStore = inject(CasesStore);
  readonly kitasStore = inject(KitasStore);
  readonly locationsStore = inject(LocationsStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);

  readonly cases = this.casesStore.cases;
  readonly status = this.casesStore.status;
  readonly error = this.casesStore.error;
  readonly isLoading = this.casesStore.isLoading;
  readonly isEmpty = this.casesStore.isEmpty;
  readonly kitas = this.kitasStore.kitas;
  readonly locations = this.locationsStore.locations;

  ngOnInit(): void {
    this.casesStore.loadCases().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.kitasStore.loadKitas().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.locationsStore.loadLocations().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  handleCreate(request: CreateCaseRequest): void {
    this.casesStore
      .createCase(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.casesStore.status() !== 'success') {
          if (this.casesStore.status() === 'error') {
            const message = this.casesStore.error()?.message ?? 'Prozess konnte nicht gespeichert werden.';
            this.toastService.error(message);
          }
          return;
        }
        this.toastService.success('Prozess wurde gespeichert.');
        const createdId = this.casesStore.lastCreatedId();
        if (createdId) {
          this.casesStore.clearCreatedId();
          from(this.router.navigate(['/cases', createdId])).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
        }
      });
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

  statusVariant(status: string): TwBadgeVariant {
    if (status === 'ACTIVE') {
      return 'success';
    }
    if (status === 'DRAFT') {
      return 'warning';
    }
    return 'neutral';
  }

  kitaLabel(kitaId: string): string {
    const match = this.kitas().find((kita) => kita.id === kitaId);
    return match ? match.name : 'Kita unbekannt';
  }
}
