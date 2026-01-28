import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CaseDetailStore } from '../../state/case-detail.store';
import { RoleInCase } from '../../../../core/models/stakeholder.model';
import { StakeholderListComponent } from '../../components/stakeholder-list/stakeholder-list.component';

@Component({
  selector: 'app-case-detail-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive, RouterOutlet, StakeholderListComponent],
  templateUrl: './case-detail.page.html',
  styleUrl: './case-detail.page.css'
})
export class CaseDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  readonly caseStore = inject(CaseDetailStore);

  readonly caseData = this.caseStore.caseData;
  readonly status = this.caseStore.status;
  readonly error = this.caseStore.error;
  readonly isLoading = this.caseStore.isLoading;
  readonly stakeholders = this.caseStore.stakeholders;
  readonly caseStatus = this.caseStore.caseStatus;
  readonly canActivate = this.caseStore.canActivate;

  readonly form = this.formBuilder.group({
    userId: ['', [Validators.required]],
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
      void this.caseStore.loadCase();
    });
  }

  async submitStakeholder(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    await this.caseStore.addStakeholder({ userId: value.userId ?? '', role: value.role ?? 'CONSULTANT' });
    this.form.reset({ userId: '', role: 'CONSULTANT' });
  }

  async activateCase(): Promise<void> {
    if (!this.canActivate()) {
      return;
    }
    await this.caseStore.activateCase();
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
}
