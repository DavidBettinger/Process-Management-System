import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CreateKitaRequest } from '../../../../core/models/kita.model';
import { Location } from '../../../../core/models/location.model';
import { isControlInvalid, requiredMessage } from '../../../../shared/forms/form-utils';

@Component({
  selector: 'app-kita-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './kita-form.component.html',
  styleUrl: './kita-form.component.css'
})
export class KitaFormComponent {
  @Input() locations: Location[] = [];
  @Input() isSubmitting = false;
  @Output() create = new EventEmitter<CreateKitaRequest>();

  private readonly formBuilder = inject(FormBuilder);
  readonly requiredMessage = requiredMessage;

  readonly form = this.formBuilder.group({
    name: ['', Validators.required],
    locationId: ['', Validators.required]
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    this.create.emit({
      name: value.name?.trim() ?? '',
      locationId: value.locationId ?? ''
    });
  }

  isInvalid(controlName: string): boolean {
    return isControlInvalid(this.form, controlName);
  }
}
