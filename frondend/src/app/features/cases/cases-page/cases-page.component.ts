import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TwButtonDirective } from '../../../shared/ui/tw/tw-button.directive';

@Component({
  selector: 'app-cases-page',
  standalone: true,
  imports: [RouterLink, TwButtonDirective],
  templateUrl: './cases-page.component.html'
})
export class CasesPageComponent {}
