import { Directive, HostBinding, Input } from '@angular/core';

export type TwButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type TwButtonSize = 'sm' | 'md' | 'lg';

@Directive({
  selector: '[appTwButton]',
  standalone: true
})
export class TwButtonDirective {
  @Input() appTwButton: TwButtonVariant = 'primary';
  @Input() size: TwButtonSize = 'md';
  @Input() fullWidth = false;

  @HostBinding('class')
  get classes(): string {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

    const sizeMap: Record<TwButtonSize, string> = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base'
    };

    const variantMap: Record<TwButtonVariant, string> = {
      primary: 'bg-slate-900 text-white hover:bg-slate-800 focus-visible:outline-slate-900',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:outline-slate-400',
      ghost: 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 focus-visible:outline-slate-300',
      danger: 'bg-rose-600 text-white hover:bg-rose-500 focus-visible:outline-rose-600'
    };

    const width = this.fullWidth ? 'w-full' : '';
    const variantKey = (this.appTwButton || 'primary') as TwButtonVariant;

    return [base, sizeMap[this.size], variantMap[variantKey], width].filter(Boolean).join(' ');
  }
}
