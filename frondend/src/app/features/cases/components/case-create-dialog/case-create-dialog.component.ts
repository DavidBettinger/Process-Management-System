import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CreateCaseRequest } from '../../../../core/models/case.model';
import { Kita } from '../../../../core/models/kita.model';
import { Location } from '../../../../core/models/location.model';

@Component({
  selector: 'app-case-create-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './case-create-dialog.component.html',
  styleUrl: './case-create-dialog.component.css'
})
export class CaseCreateDialogComponent {
  @Input() kitas: Kita[] = [];
  @Input() locations: Location[] = [];
  @Output() create = new EventEmitter<CreateCaseRequest>();

  readonly submitting = signal(false);

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

  locationLabel(locationId: string): string {
    const match = this.locations.find((location) => location.id === locationId);
    return match ? match.label : 'Standort unbekannt';
  }
}
