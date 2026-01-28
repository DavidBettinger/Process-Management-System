import { Component, EventEmitter, Output, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CreateCaseRequest } from '../../../../core/models/case.model';

@Component({
  selector: 'app-case-create-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './case-create-dialog.component.html',
  styleUrl: './case-create-dialog.component.css'
})
export class CaseCreateDialogComponent {
  @Output() create = new EventEmitter<CreateCaseRequest>();

  readonly submitting = signal(false);

  private readonly formBuilder = inject(FormBuilder);

  readonly form = this.formBuilder.group({
    title: ['', Validators.required],
    kitaName: ['', Validators.required]
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
      kitaName: value.kitaName ?? ''
    });
    this.submitting.set(false);
  }
}
