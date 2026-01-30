import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CreateCaseRequest } from '../../../../core/models/case.model';
import { CaseCreateDialogComponent } from './case-create-dialog.component';


describe('CaseCreateDialogComponent', () => {
  it('does not emit when form is invalid', () => {
    TestBed.configureTestingModule({
      imports: [CaseCreateDialogComponent],
      providers: [provideRouter([])]
    });

    const fixture = TestBed.createComponent(CaseCreateDialogComponent);
    const component = fixture.componentInstance;

    const emitted: CreateCaseRequest[] = [];
    component.create.subscribe((value) => emitted.push(value));

    component.submit();

    expect(emitted.length).toBe(0);
  });

  it('emits a create request when form is valid', () => {
    TestBed.configureTestingModule({
      imports: [CaseCreateDialogComponent],
      providers: [provideRouter([])]
    });

    const fixture = TestBed.createComponent(CaseCreateDialogComponent);
    const component = fixture.componentInstance;

    component.kitas = [
      { id: 'kita-1', name: 'Kita Sonnenblume', locationId: 'loc-1' }
    ];
    component.locations = [
      {
        id: 'loc-1',
        label: 'Standort Mitte',
        address: {
          street: 'Musterstrasse',
          houseNumber: '12',
          postalCode: '10115',
          city: 'Berlin',
          country: 'DE'
        }
      }
    ];

    component.form.setValue({
      title: 'Neuer Prozess',
      kitaId: 'kita-1'
    });

    const emitted: CreateCaseRequest[] = [];
    component.create.subscribe((value) => emitted.push(value));

    component.submit();

    expect(emitted.length).toBe(1);
    expect(emitted[0]).toEqual({
      title: 'Neuer Prozess',
      kitaId: 'kita-1'
    });
  });
});
