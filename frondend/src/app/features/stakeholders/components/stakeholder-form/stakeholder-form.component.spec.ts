import { TestBed } from '@angular/core/testing';
import { CreateStakeholderRequest } from '../../../../core/models/stakeholder.model';
import { StakeholderFormComponent } from './stakeholder-form.component';

describe('StakeholderFormComponent', () => {
  it('does not emit when form is invalid', () => {
    TestBed.configureTestingModule({
      imports: [StakeholderFormComponent]
    });

    const fixture = TestBed.createComponent(StakeholderFormComponent);
    const component = fixture.componentInstance;

    const emitted: CreateStakeholderRequest[] = [];
    component.create.subscribe((value) => emitted.push(value));

    component.submit();

    expect(emitted.length).toBe(0);
  });

  it('emits a create request when form is valid', () => {
    TestBed.configureTestingModule({
      imports: [StakeholderFormComponent]
    });

    const fixture = TestBed.createComponent(StakeholderFormComponent);
    const component = fixture.componentInstance;

    component.form.setValue({
      firstName: 'Maria',
      lastName: 'Becker',
      role: 'CONSULTANT'
    });

    const emitted: CreateStakeholderRequest[] = [];
    component.create.subscribe((value) => emitted.push(value));

    component.submit();

    expect(emitted.length).toBe(1);
    expect(emitted[0]).toEqual({
      firstName: 'Maria',
      lastName: 'Becker',
      role: 'CONSULTANT'
    });
  });
});
