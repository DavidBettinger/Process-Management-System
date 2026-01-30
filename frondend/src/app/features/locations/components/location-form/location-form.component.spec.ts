import { TestBed } from '@angular/core/testing';
import { CreateLocationRequest } from '../../../../core/models/location.model';
import { LocationFormComponent } from './location-form.component';

describe('LocationFormComponent', () => {
  it('does not emit when form is invalid', () => {
    TestBed.configureTestingModule({
      imports: [LocationFormComponent]
    });

    const fixture = TestBed.createComponent(LocationFormComponent);
    const component = fixture.componentInstance;

    const emitted: CreateLocationRequest[] = [];
    component.create.subscribe((value) => emitted.push(value));

    component.submit();

    expect(emitted.length).toBe(0);
  });

  it('emits a create request with default country', () => {
    TestBed.configureTestingModule({
      imports: [LocationFormComponent]
    });

    const fixture = TestBed.createComponent(LocationFormComponent);
    const component = fixture.componentInstance;

    component.form.setValue({
      label: 'Kita Sonnenblume',
      street: 'Musterstrasse',
      houseNumber: '12',
      postalCode: '10115',
      city: 'Berlin',
      country: ''
    });

    const emitted: CreateLocationRequest[] = [];
    component.create.subscribe((value) => emitted.push(value));

    component.submit();

    expect(emitted.length).toBe(1);
    expect(emitted[0]).toEqual({
      label: 'Kita Sonnenblume',
      address: {
        street: 'Musterstrasse',
        houseNumber: '12',
        postalCode: '10115',
        city: 'Berlin',
        country: 'DE'
      }
    });
  });
});
