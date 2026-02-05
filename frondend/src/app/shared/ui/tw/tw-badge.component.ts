import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type TwBadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'app-tw-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tw-badge.component.html'
})
export class TwBadgeComponent {
  @Input() variant: TwBadgeVariant = 'neutral';

  get classes(): string {
    const base =
      'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide';
    const variants: Record<TwBadgeVariant, string> = {
      neutral: 'border-slate-200 bg-slate-50 text-slate-700',
      success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      warning: 'border-amber-200 bg-amber-50 text-amber-700',
      danger: 'border-rose-200 bg-rose-50 text-rose-700',
      info: 'border-sky-200 bg-sky-50 text-sky-700'
    };

    const variantKey = (this.variant || 'neutral') as TwBadgeVariant;
    return [base, variants[variantKey]].join(' ');
  }
}
