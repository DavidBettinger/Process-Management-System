import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KitasStore } from '../../state/kitas.store';
import { LocationsStore } from '../../../locations/state/locations.store';
import { CreateKitaRequest } from '../../../../core/models/kita.model';
import { KitaFormComponent } from '../../components/kita-form/kita-form.component';
import { KitaListComponent } from '../../components/kita-list/kita-list.component';
import { ToastService } from '../../../../shared/ui/toast.service';
import { TwPageComponent } from '../../../../shared/ui/tw/tw-page.component';
import { TwCardComponent } from '../../../../shared/ui/tw/tw-card.component';
import { TwButtonDirective } from '../../../../shared/ui/tw/tw-button.directive';

@Component({
  selector: 'app-kitas-page',
  standalone: true,
  imports: [CommonModule, KitaFormComponent, KitaListComponent, TwPageComponent, TwCardComponent, TwButtonDirective],
  templateUrl: './kitas-page.page.html'
})
export class KitasPageComponent implements OnInit {
  readonly kitasStore = inject(KitasStore);
  readonly locationsStore = inject(LocationsStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);

  readonly kitas = this.kitasStore.kitas;
  readonly status = this.kitasStore.status;
  readonly error = this.kitasStore.error;
  readonly isLoading = this.kitasStore.isLoading;
  readonly isEmpty = this.kitasStore.isEmpty;

  readonly locations = this.locationsStore.locations;
  readonly locationsStatus = this.locationsStore.status;
  readonly locationsError = this.locationsStore.error;

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
          this.toastService.success('Kita wurde gespeichert.');
          return;
        }
        if (this.kitasStore.status() === 'error') {
          const message = this.kitasStore.error()?.message ?? 'Kita konnte nicht gespeichert werden.';
          this.toastService.error(message);
        }
      });
  }

  retryLocations(): void {
    this.locationsStore.loadLocations().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}
