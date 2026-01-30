import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Kita } from '../../../../core/models/kita.model';
import { Location } from '../../../../core/models/location.model';

@Component({
  selector: 'app-kita-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kita-list.component.html',
  styleUrl: './kita-list.component.css'
})
export class KitaListComponent {
  @Input() kitas: Kita[] = [];
  @Input() locations: Location[] = [];

  locationLabel(locationId: string): string {
    const match = this.locations.find((location) => location.id === locationId);
    return match ? match.label : 'Standort unbekannt';
  }
}
