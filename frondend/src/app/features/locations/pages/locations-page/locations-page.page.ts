import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LocationsStore } from '../../state/locations.store';
import { CreateLocationRequest } from '../../../../core/models/location.model';
import { LocationFormComponent } from '../../components/location-form/location-form.component';
import { LocationListComponent } from '../../components/location-list/location-list.component';
import { ToastService } from '../../../../shared/ui/toast.service';

@Component({
  selector: 'app-locations-page',
  standalone: true,
  imports: [CommonModule, LocationFormComponent, LocationListComponent],
  templateUrl: './locations-page.page.html',
  styleUrl: './locations-page.page.css'
})
export class LocationsPageComponent implements OnInit {
  readonly locationsStore = inject(LocationsStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);

  readonly locations = this.locationsStore.locations;
  readonly status = this.locationsStore.status;
  readonly error = this.locationsStore.error;
  readonly isLoading = this.locationsStore.isLoading;
  readonly isEmpty = this.locationsStore.isEmpty;

  ngOnInit(): void {
    this.locationsStore.loadLocations().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  handleCreate(request: CreateLocationRequest): void {
    this.locationsStore
      .createLocation(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.locationsStore.status() === 'success') {
          this.toastService.success('Standort wurde gespeichert.');
          return;
        }
        if (this.locationsStore.status() === 'error') {
          const message = this.locationsStore.error()?.message ?? 'Standort konnte nicht gespeichert werden.';
          this.toastService.error(message);
        }
      });
  }
}
