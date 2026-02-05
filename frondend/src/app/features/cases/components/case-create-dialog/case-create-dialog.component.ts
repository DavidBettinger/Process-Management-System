import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CreateCaseRequest } from '../../../../core/models/case.model';
import { Kita } from '../../../../core/models/kita.model';
import { Location } from '../../../../core/models/location.model';
import { isControlInvalid, requiredMessage } from '../../../../shared/forms/form-utils';
import { TwCardComponent } from '../../../../shared/ui/tw/tw-card.component';
import { TwFieldComponent } from '../../../../shared/ui/tw/tw-field.component';
import { TwButtonDirective } from '../../../../shared/ui/tw/tw-button.directive';

@Component({
  selector: 'app-case-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TwCardComponent,
    TwFieldComponent,
    TwButtonDirective
  ],
  templateUrl: './case-create-dialog.component.html'
})
export class CaseCreateDialogComponent {
  @Input() kitas: Kita[] = [];
  @Input() locations: Location[] = [];
  @Output() create = new EventEmitter<CreateCaseRequest>();

  readonly submitting = signal(false);
  readonly requiredMessage = requiredMessage;

  private readonly formBuilder = inject(FormBuilder);

  readonly form = this.formBuilder.group({
    title: ['', Validators.required],
    kitaId: ['', Validators.required]
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.submitting.set(true);
    const value = this.form.getRawValue();
    this.create.emit({
      title: value.title ?? '',
      kitaId: value.kitaId ?? ''
    });
    this.submitting.set(false);
  }

  isInvalid(controlName: string): boolean {
    return isControlInvalid(this.form, controlName);
  }

  locationLabel(locationId: string): string {
    const match = this.locations.find((location) => location.id === locationId);
    return match ? match.label : 'Standort unbekannt';
  }
}
