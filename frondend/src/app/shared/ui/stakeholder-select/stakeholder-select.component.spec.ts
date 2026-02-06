import { TestBed } from '@angular/core/testing';
import { StakeholderSelectComponent } from './stakeholder-select.component';
import { Stakeholder } from '../../../core/models/stakeholder.model';

const stakeholders: Stakeholder[] = [
  { id: 's-1', firstName: 'Maria', lastName: 'Becker', role: 'CONSULTANT' },
  { id: 's-2', firstName: 'Jonas', lastName: 'Keller', role: 'DIRECTOR' }
];

describe('StakeholderSelectComponent', () => {
  it('renders options with name and role', () => {
    TestBed.configureTestingModule({
      imports: [StakeholderSelectComponent]
    });

    const fixture = TestBed.createComponent(StakeholderSelectComponent);
    const component = fixture.componentInstance;
    component.stakeholders = stakeholders;
    fixture.detectChanges();

    const options = Array.from(
      fixture.nativeElement.querySelectorAll('option')
    ) as HTMLOptionElement[];
    const labels = options.map((option) => option.textContent?.trim());

    expect(labels).toContain('Maria Becker — Beratung');
    expect(labels).toContain('Jonas Keller — Leitung');
  });

  it('emits selected id on change', () => {
    TestBed.configureTestingModule({
      imports: [StakeholderSelectComponent]
    });

    const fixture = TestBed.createComponent(StakeholderSelectComponent);
    const component = fixture.componentInstance;
    component.stakeholders = stakeholders;
    fixture.detectChanges();

    const emitted: Array<string | null> = [];
    component.selectedIdChange.subscribe((value) => emitted.push(value));

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = 's-2';
    select.dispatchEvent(new Event('change'));

    expect(emitted).toEqual(['s-2']);
  });

  it('preselects matching stakeholder id', () => {
    TestBed.configureTestingModule({
      imports: [StakeholderSelectComponent]
    });

    const fixture = TestBed.createComponent(StakeholderSelectComponent);
    const component = fixture.componentInstance;
    component.stakeholders = stakeholders;
    component.selectedId = 's-2';
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(select.value).toBe('s-2');
  });

  it('does not auto-select first option when selected id is unknown', () => {
    TestBed.configureTestingModule({
      imports: [StakeholderSelectComponent]
    });

    const fixture = TestBed.createComponent(StakeholderSelectComponent);
    const component = fixture.componentInstance;
    component.stakeholders = stakeholders;
    component.selectedId = 'unknown-id';
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(select.value).toBe('');
  });

  it('shows empty state when no stakeholders exist', () => {
    TestBed.configureTestingModule({
      imports: [StakeholderSelectComponent]
    });

    const fixture = TestBed.createComponent(StakeholderSelectComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Keine Beteiligten vorhanden');
  });
});
