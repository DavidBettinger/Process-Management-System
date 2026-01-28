import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DevSessionService {
  readonly userId = signal('u-101');
  readonly tenantId = signal('tenant-001');
}
