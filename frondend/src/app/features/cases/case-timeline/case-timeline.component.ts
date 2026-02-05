import { Component } from '@angular/core';
import { TwBadgeComponent } from '../../../shared/ui/tw/tw-badge.component';

@Component({
  selector: 'app-case-timeline',
  standalone: true,
  imports: [TwBadgeComponent],
  templateUrl: './case-timeline.component.html'
})
export class CaseTimelineComponent {}
