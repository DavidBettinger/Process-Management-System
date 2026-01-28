import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DevSessionService {
  readonly userId = signal(environment.devAuth.userId || 'u-101');
  readonly tenantId = signal(environment.devAuth.tenantId || 'tenant-001');
}
