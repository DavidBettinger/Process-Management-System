import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CaseDetailStore } from '../../state/case-detail.store';
import { RoleInCase } from '../../../../core/models/stakeholder.model';
import { StakeholderListComponent } from '../../components/stakeholder-list/stakeholder-list.component';
import { KitasStore } from '../../../kitas/state/kitas.store';
import { LocationsStore } from '../../../locations/state/locations.store';
import { Kita } from '../../../../core/models/kita.model';
import { Location } from '../../../../core/models/location.model';
import { StakeholdersStore } from '../../../stakeholders/state/stakeholders.store';
import { StakeholderSelectComponent } from '../../../../shared/ui/stakeholder-select/stakeholder-select.component';

@Component({
  selector: 'app-case-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    StakeholderListComponent,
    StakeholderSelectComponent
  ],
  templateUrl: './case-detail.page.html',
  styleUrl: './case-detail.page.css'
})
export class CaseDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  readonly caseStore = inject(CaseDetailStore);
  readonly kitasStore = inject(KitasStore);
  readonly locationsStore = inject(LocationsStore);
  readonly stakeholdersStore = inject(StakeholdersStore);

  readonly caseData = this.caseStore.caseData;
  readonly status = this.caseStore.status;
  readonly error = this.caseStore.error;
  readonly isLoading = this.caseStore.isLoading;
  readonly stakeholders = this.caseStore.stakeholders;
  readonly caseStatus = this.caseStore.caseStatus;
  readonly canActivate = this.caseStore.canActivate;
  readonly kitas = this.kitasStore.kitas;
  readonly locations = this.locationsStore.locations;
  readonly availableStakeholders = this.stakeholdersStore.stakeholders;
  readonly stakeholdersStatus = this.stakeholdersStore.status;
  readonly stakeholdersError = this.stakeholdersStore.error;

  readonly form = this.formBuilder.group({
    stakeholderId: ['', [Validators.required]],
    role: ['CONSULTANT' as RoleInCase, [Validators.required]]
  });

  readonly roleOptions: { value: RoleInCase; label: string }[] = [
    { value: 'CONSULTANT', label: 'Fachberatung' },
    { value: 'DIRECTOR', label: 'Leitung' },
    { value: 'TEAM_MEMBER', label: 'Teammitglied' }
  ];

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const caseId = params.get('caseId');
      if (caseId) {
        this.caseStore.setCaseId(caseId);
      }
      this.caseStore.loadCase().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    });
    this.kitasStore.loadKitas().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.locationsStore.loadLocations().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.stakeholdersStore.loadStakeholders().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  submitStakeholder(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.stakeholdersStatus() !== 'success') {
      return;
    }
    const value = this.form.getRawValue();
    this.caseStore
      .addStakeholder({
        userId: value.stakeholderId ?? '',
        role: value.role ?? 'CONSULTANT'
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.caseStore.status() === 'success') {
          this.form.reset({ stakeholderId: '', role: 'CONSULTANT' });
        }
      });
  }

  activateCase(): void {
    if (!this.canActivate()) {
      return;
    }
    this.caseStore.activateCase().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  statusLabel(status: string | null): string {
    if (status === 'ACTIVE') {
      return 'Aktiv';
    }
    if (status === 'DRAFT') {
      return 'Entwurf';
    }
    return 'Unbekannt';
  }

  activationHint(): string | null {
    if (this.caseStatus() === 'DRAFT' && !this.canActivate()) {
      return 'Zum Aktivieren wird mindestens eine Fachberatung benoetigt.';
    }
    if (this.caseStatus() === 'ACTIVE') {
      return 'Der Prozess ist bereits aktiv.';
    }
    return null;
  }

  kitaName(kitaId: string | null | undefined): string {
    if (!kitaId) {
      return 'Kita unbekannt';
    }
    const kita = this.findKita(kitaId);
    return kita ? kita.name : 'Kita unbekannt';
  }

  locationLabelForKita(kitaId: string | null | undefined): string {
    const location = this.findLocationForKita(kitaId);
    return location ? location.label : 'Standort unbekannt';
  }

  locationAddressForKita(kitaId: string | null | undefined): string {
    const location = this.findLocationForKita(kitaId);
    if (!location) {
      return 'Adresse nicht verfuegbar';
    }
    const address = location.address;
    const country = address.country?.trim();
    const countryLabel = country && country.length > 0 ? country : 'DE';
    return `${address.street} ${address.houseNumber}, ${address.postalCode} ${address.city}, ${countryLabel}`;
  }

  private findKita(kitaId: string): Kita | undefined {
    return this.kitas().find((kita) => kita.id === kitaId);
  }

  private findLocationForKita(kitaId: string | null | undefined): Location | undefined {
    if (!kitaId) {
      return undefined;
    }
    const kita = this.findKita(kitaId);
    if (!kita) {
      return undefined;
    }
    return this.locations().find((location) => location.id === kita.locationId);
  }
}
