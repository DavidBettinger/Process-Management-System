import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LocationsStore } from '../../state/locations.store';
import { CreateLocationRequest } from '../../../../core/models/location.model';
import { LocationFormComponent } from '../../components/location-form/location-form.component';
import { LocationListComponent } from '../../components/location-list/location-list.component';

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

  readonly locations = this.locationsStore.locations;
  readonly status = this.locationsStore.status;
  readonly error = this.locationsStore.error;
  readonly isLoading = this.locationsStore.isLoading;
  readonly isEmpty = this.locationsStore.isEmpty;

  readonly toastMessage = signal<string | null>(null);

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.locationsStore.loadLocations().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  handleCreate(request: CreateLocationRequest): void {
    this.locationsStore
      .createLocation(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.locationsStore.status() === 'success') {
          this.showToast('Standort wurde gespeichert.');
        }
      });
  }

  private showToast(message: string): void {
    if (this.toastTimer) {
      window.clearTimeout(this.toastTimer);
    }
    this.toastMessage.set(message);
    this.toastTimer = window.setTimeout(() => {
      this.toastMessage.set(null);
    }, 3000);
  }
}
