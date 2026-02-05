import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tw-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tw-card.component.html'
})
export class TwCardComponent {
  @Input() className = '';
  @Input() padded = true;

  get classes(): string {
    const base = 'rounded-2xl border border-slate-200 bg-white shadow-sm';
    const padding = this.padded ? 'p-5' : '';
    return [base, padding, this.className].filter(Boolean).join(' ');
  }
}
