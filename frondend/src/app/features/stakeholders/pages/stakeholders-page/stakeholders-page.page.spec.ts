import { TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { StakeholdersPageComponent } from './stakeholders-page.page';
import { StakeholdersStore } from '../../state/stakeholders.store';
import { initialListState, ListState } from '../../../../core/state/state.types';
import { Stakeholder } from '../../../../core/models/stakeholder.model';

class StakeholdersStoreStub {
  state = signal<ListState<Stakeholder>>(initialListState());
  stakeholders = computed(() => this.state().items);
  status = computed(() => this.state().status);
  error = computed(() => this.state().error);
  isLoading = computed(() => this.state().status === 'loading');
  isEmpty = computed(() => this.state().status === 'success' && this.state().items.length === 0);
  loadStakeholdersCalls = 0;
  createStakeholderCalls = 0;

  loadStakeholders = () => {
    this.loadStakeholdersCalls += 1;
    return of(void 0);
  };

  createStakeholder = () => {
    this.createStakeholderCalls += 1;
    return of(void 0);
  };
}

describe('StakeholdersPageComponent', () => {
  it('shows empty state', () => {
    const store = new StakeholdersStoreStub();
    store.state.set({ items: [], status: 'success' });

    TestBed.configureTestingModule({
      imports: [StakeholdersPageComponent],
      providers: [{ provide: StakeholdersStore, useValue: store }, provideRouter([])]
    });

    const fixture = TestBed.createComponent(StakeholdersPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Noch keine Beteiligten vorhanden');
    expect(store.loadStakeholdersCalls).toBe(1);
  });

  it('shows error state', () => {
    const store = new StakeholdersStoreStub();
    store.state.set({
      items: [],
      status: 'error',
      error: { message: 'Fehler' }
    });

    TestBed.configureTestingModule({
      imports: [StakeholdersPageComponent],
      providers: [{ provide: StakeholdersStore, useValue: store }, provideRouter([])]
    });

    const fixture = TestBed.createComponent(StakeholdersPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Beteiligte konnten nicht geladen werden');
    expect(compiled.textContent).toContain('Fehler');
  });

  it('renders stakeholders list', () => {
    const store = new StakeholdersStoreStub();
    store.state.set({
      items: [
        {
          id: 's-1',
          firstName: 'Maria',
          lastName: 'Becker',
          role: 'CONSULTANT'
        }
      ],
      status: 'success'
    });

    TestBed.configureTestingModule({
      imports: [StakeholdersPageComponent],
      providers: [{ provide: StakeholdersStore, useValue: store }, provideRouter([])]
    });

    const fixture = TestBed.createComponent(StakeholdersPageComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Maria Becker');
    expect(compiled.textContent).toContain('Beratung');
  });

  it('calls store when creating stakeholder', () => {
    const store = new StakeholdersStoreStub();

    TestBed.configureTestingModule({
      imports: [StakeholdersPageComponent],
      providers: [{ provide: StakeholdersStore, useValue: store }, provideRouter([])]
    });

    const fixture = TestBed.createComponent(StakeholdersPageComponent);
    const component = fixture.componentInstance;

    component.handleCreate({
      firstName: 'Maria',
      lastName: 'Becker',
      role: 'CONSULTANT'
    });

    expect(store.createStakeholderCalls).toBe(1);
  });
});
