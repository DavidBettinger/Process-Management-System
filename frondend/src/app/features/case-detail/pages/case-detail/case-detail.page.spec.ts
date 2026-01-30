import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { signal, computed } from '@angular/core';
import { of } from 'rxjs';
import { CaseDetailPageComponent } from './case-detail.page';
import { CaseDetailStore } from '../../state/case-detail.store';
import { CaseStatus, ProcessCase } from '../../../../core/models/case.model';
import { RoleInCase, StakeholderResponse } from '../../../../core/models/stakeholder.model';
import { LoadStatus, StoreError } from '../../../../core/state/state.types';
import { KitasStore } from '../../../kitas/state/kitas.store';
import { LocationsStore } from '../../../locations/state/locations.store';
import { StakeholdersStore } from '../../../stakeholders/state/stakeholders.store';
import { Kita } from '../../../../core/models/kita.model';
import { Location } from '../../../../core/models/location.model';
import { Stakeholder } from '../../../../core/models/stakeholder.model';

class CaseDetailStoreStub {
  caseData = signal<ProcessCase | null>(null);
  status = signal<LoadStatus>('idle');
  error = signal<StoreError | undefined>(undefined);
  stakeholders = signal<StakeholderResponse[]>([]);
  caseStatus = signal<CaseStatus | null>(null);
  canActivate = signal<boolean>(false);
  isLoading = computed(() => this.status() === 'loading');

  setCaseIdValue: string | null = null;
  loadCaseCalls = 0;
  addStakeholderCalls: { userId: string; role: RoleInCase }[] = [];
  activateCaseCalls = 0;

  setCaseId = (value: string) => {
    this.setCaseIdValue = value;
  };
  loadCase = () => {
    this.loadCaseCalls += 1;
  };
  addStakeholder = async (request: { userId: string; role: RoleInCase }) => {
    this.addStakeholderCalls.push(request);
  };
  activateCase = async () => {
    this.activateCaseCalls += 1;
  };
}

class KitasStoreStub {
  kitas = signal<Kita[]>([]);
  loadKitasCalls = 0;

  loadKitas = () => {
    this.loadKitasCalls += 1;
  };
}

class LocationsStoreStub {
  locations = signal<Location[]>([]);
  loadLocationsCalls = 0;

  loadLocations = () => {
    this.loadLocationsCalls += 1;
  };
}

class StakeholdersStoreStub {
  stakeholders = signal<Stakeholder[]>([]);
  status = signal<LoadStatus>('idle');
  error = signal<StoreError | undefined>(undefined);
  loadCalls = 0;

  loadStakeholders = () => {
    this.loadCalls += 1;
  };
}

describe('CaseDetailPageComponent', () => {
  const buildStore = (): CaseDetailStoreStub => {
    const store = new CaseDetailStoreStub();
    store.caseData.set({
      id: 'case-1',
      tenantId: 't-1',
      title: 'Prozess Alpha',
      kitaId: 'kita-1',
      status: 'DRAFT',
      stakeholders: [],
      createdAt: '2026-01-01T00:00:00Z'
    });
    store.status.set('success');
    store.caseStatus.set('DRAFT');
    store.stakeholders.set([]);
    return store;
  };

  it('submits stakeholder form', async () => {
    const store = buildStore();
    const kitasStore = new KitasStoreStub();
    const locationsStore = new LocationsStoreStub();
    const stakeholdersStore = new StakeholdersStoreStub();
    stakeholdersStore.status.set('success');
    stakeholdersStore.stakeholders.set([
      { id: 's-1', firstName: 'Maria', lastName: 'Becker', role: 'CONSULTANT' }
    ]);

    TestBed.configureTestingModule({
      imports: [CaseDetailPageComponent],
      providers: [
        { provide: CaseDetailStore, useValue: store },
        { provide: KitasStore, useValue: kitasStore },
        { provide: LocationsStore, useValue: locationsStore },
        { provide: StakeholdersStore, useValue: stakeholdersStore },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ caseId: 'case-1' })) }
        }
      ]
    });

    const fixture = TestBed.createComponent(CaseDetailPageComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const compiled = fixture.nativeElement as HTMLElement;
    component.form.controls.stakeholderId.setValue('s-1');
    const select = compiled.querySelector('select[formControlName="role"]') as HTMLSelectElement;
    select.value = 'CONSULTANT';
    select.dispatchEvent(new Event('change'));

    const form = compiled.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(store.addStakeholderCalls).toEqual([{ userId: 's-1', role: 'CONSULTANT' }]);
  });

  it('activates the case when allowed', async () => {
    const store = buildStore();
    const kitasStore = new KitasStoreStub();
    const locationsStore = new LocationsStoreStub();
    const stakeholdersStore = new StakeholdersStoreStub();
    store.canActivate.set(true);

    TestBed.configureTestingModule({
      imports: [CaseDetailPageComponent],
      providers: [
        { provide: CaseDetailStore, useValue: store },
        { provide: KitasStore, useValue: kitasStore },
        { provide: LocationsStore, useValue: locationsStore },
        { provide: StakeholdersStore, useValue: stakeholdersStore },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ caseId: 'case-1' })) }
        }
      ]
    });

    const fixture = TestBed.createComponent(CaseDetailPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = Array.from(compiled.querySelectorAll('button'))
      .find((element) => element.textContent?.includes('Prozess aktivieren')) as HTMLButtonElement;
    button.click();
    await fixture.whenStable();

    expect(store.activateCaseCalls).toBe(1);
  });

  it('shows hint when activation is not allowed', () => {
    const store = buildStore();
    const kitasStore = new KitasStoreStub();
    const locationsStore = new LocationsStoreStub();
    const stakeholdersStore = new StakeholdersStoreStub();
    store.canActivate.set(false);
    store.caseStatus.set('DRAFT');

    TestBed.configureTestingModule({
      imports: [CaseDetailPageComponent],
      providers: [
        { provide: CaseDetailStore, useValue: store },
        { provide: KitasStore, useValue: kitasStore },
        { provide: LocationsStore, useValue: locationsStore },
        { provide: StakeholdersStore, useValue: stakeholdersStore },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ caseId: 'case-1' })) }
        }
      ]
    });

    const fixture = TestBed.createComponent(CaseDetailPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('mindestens eine Fachberatung');
  });
});
