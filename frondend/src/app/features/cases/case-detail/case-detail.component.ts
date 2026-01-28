import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './case-detail.component.html',
  styleUrl: './case-detail.component.css'
})
export class CaseDetailComponent {
  private readonly route = inject(ActivatedRoute);

  readonly caseId = computed(() => this.route.snapshot.paramMap.get('caseId') ?? 'unknown');
}
