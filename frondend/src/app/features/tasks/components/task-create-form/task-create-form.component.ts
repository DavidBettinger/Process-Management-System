import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateTaskRequest } from '../../../../core/models/task.model';
import { isControlInvalid, requiredMessage } from '../../../../shared/forms/form-utils';
import { TwFieldComponent } from '../../../../shared/ui/tw/tw-field.component';
import { TwButtonDirective } from '../../../../shared/ui/tw/tw-button.directive';

@Component({
  selector: 'app-task-create-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TwFieldComponent, TwButtonDirective],
  templateUrl: './task-create-form.component.html'
})
export class TaskCreateFormComponent {
  @Input() showHeader = true;
  @Input() headerTitle = 'Aufgabe erstellen';
  @Input() headerSubtitle = 'Lege eine neue Aufgabe fuer diesen Prozess an.';
  @Input() submitLabel = 'Aufgabe erstellen';
  @Input() showCancel = false;
  @Input() cancelLabel = 'Abbrechen';
  @Input() showPriority = true;
  @Input() showDescription = true;
  @Input() showDueDate = true;
  @Input() useFormTag = true;
  @Input() loading = false;
  @Output() create = new EventEmitter<CreateTaskRequest>();
  @Output() cancel = new EventEmitter<void>();

  readonly requiredMessage = requiredMessage;

  private readonly formBuilder = inject(FormBuilder);

  readonly priorityOptions: { value: number; label: string }[] = [
    { value: 1, label: 'Sehr wichtig' },
    { value: 2, label: 'Wichtig' },
    { value: 3, label: 'Mittel' },
    { value: 4, label: 'Eher unwichtig' },
    { value: 5, label: 'Nicht wichtig' }
  ];

  readonly form = this.formBuilder.group({
    title: ['', Validators.required],
    priority: [3, Validators.required],
    description: [''],
    dueDate: ['']
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading) {
      return;
    }
    const value = this.form.getRawValue();
    const description = value.description?.trim() ? value.description.trim() : null;
    const dueDate = value.dueDate?.trim() ? value.dueDate.trim() : null;
    const priority = Number(value.priority ?? 3);

    this.create.emit({
      title: value.title ?? '',
      description,
      priority,
      dueDate
    });

    this.resetForm();
  }

  handleCancel(): void {
    this.resetForm();
    this.cancel.emit();
  }

  resetForm(): void {
    this.form.reset({
      title: '',
      priority: 3,
      description: '',
      dueDate: ''
    });
  }

  isInvalid(controlName: string): boolean {
    return isControlInvalid(this.form, controlName);
  }
}
