import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { buildApiUrl } from './api.config';
import {
  CreateStakeholderRequest,
  CreateStakeholderResponse,
  StakeholdersListResponse
} from '../models/stakeholder.model';

@Injectable({ providedIn: 'root' })
export class StakeholdersApi {
  constructor(private readonly http: HttpClient) {}

  createStakeholder(request: CreateStakeholderRequest): Observable<CreateStakeholderResponse> {
    return this.http.post<CreateStakeholderResponse>(buildApiUrl('/stakeholders'), request);
  }

  listStakeholders(): Observable<StakeholdersListResponse> {
    return this.http.get<StakeholdersListResponse>(buildApiUrl('/stakeholders'));
  }
}
