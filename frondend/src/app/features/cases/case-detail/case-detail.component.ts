import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TwButtonDirective } from '../../../shared/ui/tw/tw-button.directive';

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TwButtonDirective],
  templateUrl: './case-detail.component.html'
})
export class CaseDetailComponent {}
