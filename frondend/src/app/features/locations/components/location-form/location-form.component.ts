import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateLocationRequest } from '../../../../core/models/location.model';
import { isControlInvalid, requiredMessage } from '../../../../shared/forms/form-utils';
import { TwCardComponent } from '../../../../shared/ui/tw/tw-card.component';
import { TwFieldComponent } from '../../../../shared/ui/tw/tw-field.component';
import { TwButtonDirective } from '../../../../shared/ui/tw/tw-button.directive';

@Component({
  selector: 'app-location-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TwCardComponent, TwFieldComponent, TwButtonDirective],
  templateUrl: './location-form.component.html'
})
export class LocationFormComponent {
  @Input() isSubmitting = false;
  @Output() create = new EventEmitter<CreateLocationRequest>();

  private readonly formBuilder = inject(FormBuilder);
  readonly requiredMessage = requiredMessage;

  readonly form = this.formBuilder.group({
    label: ['', Validators.required],
    street: ['', Validators.required],
    houseNumber: ['', Validators.required],
    postalCode: ['', Validators.required],
    city: ['', Validators.required],
    country: ['DE']
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    const country = value.country?.trim() || 'DE';

    this.create.emit({
      label: value.label?.trim() ?? '',
      address: {
        street: value.street?.trim() ?? '',
        houseNumber: value.houseNumber?.trim() ?? '',
        postalCode: value.postalCode?.trim() ?? '',
        city: value.city?.trim() ?? '',
        country
      }
    });
  }

  isInvalid(controlName: string): boolean {
    return isControlInvalid(this.form, controlName);
  }
}
