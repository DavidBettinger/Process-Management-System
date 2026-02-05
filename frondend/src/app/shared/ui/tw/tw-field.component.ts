import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tw-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tw-field.component.html'
})
export class TwFieldComponent {
  @Input() label?: string;
  @Input() hint?: string;
  @Input() error?: string | null;
  @Input() forId?: string;
  @Input() required = false;
}
