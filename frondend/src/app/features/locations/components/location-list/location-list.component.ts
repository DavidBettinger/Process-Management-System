import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Location } from '../../../../core/models/location.model';

@Component({
  selector: 'app-location-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location-list.component.html',
  styleUrl: './location-list.component.css'
})
export class LocationListComponent {
  @Input() locations: Location[] = [];

  countryLabel(country?: string | null): string {
    const normalized = country?.trim();
    return normalized && normalized.length > 0 ? normalized : 'DE';
  }
}
