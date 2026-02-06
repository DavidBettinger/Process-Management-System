import { Injectable, signal } from '@angular/core';

export interface TimelineOverlayPosition {
  left: number;
  top: number;
}

@Injectable({ providedIn: 'root' })
export class TimelineOverlayPositionStore {
  readonly position = signal<TimelineOverlayPosition | null>(null);

  setPosition(position: TimelineOverlayPosition): void {
    this.position.set(position);
  }
}
