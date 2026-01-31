import { FormGroup } from '@angular/forms';

export const requiredMessage = (label: string): string => `${label} ist erforderlich.`;

export const isControlInvalid = (form: FormGroup, controlName: string): boolean => {
  const control = form.get(controlName);
  return !!control && control.invalid && (control.dirty || control.touched);
};
