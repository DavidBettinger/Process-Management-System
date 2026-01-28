import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { DevSessionService } from './dev-session.service';

@Injectable({ providedIn: 'root' })
export class DevAuthService {
  readonly userId = signal(environment.devAuth.userId);
  readonly tenantId = signal(environment.devAuth.tenantId);
  readonly enabled = signal(environment.devAuth.enabled);

  constructor(private readonly devSessionService: DevSessionService) {
    if (!environment.production && environment.devAuth.enabled) {
      this.userId.set(this.devSessionService.userId());
      this.tenantId.set(this.devSessionService.tenantId());
    }
  }
}
