import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateStakeholderRequest, StakeholderRole } from '../../../../core/models/stakeholder.model';
import { isControlInvalid, requiredMessage } from '../../../../shared/forms/form-utils';
import { TwButtonDirective } from '../../../../shared/ui/tw/tw-button.directive';
import { TwCardComponent } from '../../../../shared/ui/tw/tw-card.component';
import { TwFieldComponent } from '../../../../shared/ui/tw/tw-field.component';

interface RoleOption {
  value: StakeholderRole;
  label: string;
}

@Component({
  selector: 'app-stakeholder-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TwButtonDirective, TwCardComponent, TwFieldComponent],
  templateUrl: './stakeholder-form.component.html'
})
export class StakeholderFormComponent {
  @Input() isSubmitting = false;
  @Output() create = new EventEmitter<CreateStakeholderRequest>();

  private readonly formBuilder = inject(FormBuilder);
  readonly requiredMessage = requiredMessage;

  readonly roles: RoleOption[] = [
    { value: 'CONSULTANT', label: 'Beratung' },
    { value: 'DIRECTOR', label: 'Leitung' },
    { value: 'TEAM_MEMBER', label: 'Teammitglied' },
    { value: 'SPONSOR', label: 'Traeger' },
    { value: 'EXTERNAL', label: 'Extern' }
  ];

  readonly form = this.formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    role: ['', Validators.required]
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    this.create.emit({
      firstName: value.firstName?.trim() ?? '',
      lastName: value.lastName?.trim() ?? '',
      role: value.role as StakeholderRole
    });
  }

  isInvalid(controlName: string): boolean {
    return isControlInvalid(this.form, controlName);
  }
}
