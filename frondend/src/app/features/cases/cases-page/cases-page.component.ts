import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cases-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cases-page.component.html',
  styleUrl: './cases-page.component.css'
})
export class CasesPageComponent {}
