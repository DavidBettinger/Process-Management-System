import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tw-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tw-page.component.html'
})
export class TwPageComponent {
  @Input() eyebrow?: string;
  @Input() title?: string;
  @Input() subtitle?: string;
}
