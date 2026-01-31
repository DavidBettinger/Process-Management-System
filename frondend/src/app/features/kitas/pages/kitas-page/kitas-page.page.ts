import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KitasStore } from '../../state/kitas.store';
import { LocationsStore } from '../../../locations/state/locations.store';
import { CreateKitaRequest } from '../../../../core/models/kita.model';
import { KitaFormComponent } from '../../components/kita-form/kita-form.component';
import { KitaListComponent } from '../../components/kita-list/kita-list.component';

@Component({
  selector: 'app-kitas-page',
  standalone: true,
  imports: [CommonModule, KitaFormComponent, KitaListComponent],
  templateUrl: './kitas-page.page.html',
  styleUrl: './kitas-page.page.css'
})
export class KitasPageComponent implements OnInit {
  readonly kitasStore = inject(KitasStore);
  readonly locationsStore = inject(LocationsStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly kitas = this.kitasStore.kitas;
  readonly status = this.kitasStore.status;
  readonly error = this.kitasStore.error;
  readonly isLoading = this.kitasStore.isLoading;
  readonly isEmpty = this.kitasStore.isEmpty;

  readonly locations = this.locationsStore.locations;
  readonly locationsStatus = this.locationsStore.status;
  readonly locationsError = this.locationsStore.error;

  readonly toastMessage = signal<string | null>(null);

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.kitasStore.loadKitas().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.locationsStore.loadLocations().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  handleCreate(request: CreateKitaRequest): void {
    this.kitasStore
      .createKita(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.kitasStore.status() === 'success') {
          this.showToast('Kita wurde gespeichert.');
        }
      });
  }

  retryLocations(): void {
    this.locationsStore.loadLocations().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
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
