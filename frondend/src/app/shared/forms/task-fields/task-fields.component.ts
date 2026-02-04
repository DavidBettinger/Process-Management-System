import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { isControlInvalid, requiredMessage } from '../form-utils';

@Component({
  selector: 'app-task-fields',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-fields.component.html',
  styleUrl: './task-fields.component.css'
})
export class TaskFieldsComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() showPriority = true;
  @Input() showDescription = true;
  @Input() showDueDate = true;

  readonly requiredMessage = requiredMessage;

  readonly priorityOptions: { value: number; label: string }[] = [
    { value: 1, label: 'Sehr wichtig' },
    { value: 2, label: 'Wichtig' },
    { value: 3, label: 'Mittel' },
    { value: 4, label: 'Eher unwichtig' },
    { value: 5, label: 'Nicht wichtig' }
  ];

  isInvalid(controlName: string): boolean {
    return isControlInvalid(this.form, controlName);
  }
}
