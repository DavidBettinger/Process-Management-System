import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CreateKitaRequest } from '../../../../core/models/kita.model';
import { KitaFormComponent } from './kita-form.component';

describe('KitaFormComponent', () => {
  it('does not emit when form is invalid', () => {
    TestBed.configureTestingModule({
      imports: [KitaFormComponent],
      providers: [provideRouter([])]
    });

    const fixture = TestBed.createComponent(KitaFormComponent);
    const component = fixture.componentInstance;

    const emitted: CreateKitaRequest[] = [];
    component.create.subscribe((value) => emitted.push(value));

    component.form.setValue({
      name: 'Kita Sonnenblume',
      locationId: ''
    });

    component.submit();

    expect(emitted.length).toBe(0);
  });

  it('emits a create request when form is valid', () => {
    TestBed.configureTestingModule({
      imports: [KitaFormComponent],
      providers: [provideRouter([])]
    });

    const fixture = TestBed.createComponent(KitaFormComponent);
    const component = fixture.componentInstance;

    component.form.setValue({
      name: 'Kita Sonnenblume',
      locationId: 'location-1'
    });

    const emitted: CreateKitaRequest[] = [];
    component.create.subscribe((value) => emitted.push(value));

    component.submit();

    expect(emitted.length).toBe(1);
    expect(emitted[0]).toEqual({
      name: 'Kita Sonnenblume',
      locationId: 'location-1'
    });
  });
});
