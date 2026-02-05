import { Component } from '@angular/core';
import { TwPageComponent } from '../../../shared/ui/tw/tw-page.component';
import { TwCardComponent } from '../../../shared/ui/tw/tw-card.component';
import { TwBadgeComponent } from '../../../shared/ui/tw/tw-badge.component';
import { TwButtonDirective } from '../../../shared/ui/tw/tw-button.directive';

@Component({
  selector: 'app-meetings-page',
  standalone: true,
  imports: [TwPageComponent, TwCardComponent, TwBadgeComponent, TwButtonDirective],
  templateUrl: './meetings-page.component.html'
})
export class MeetingsPageComponent {}
