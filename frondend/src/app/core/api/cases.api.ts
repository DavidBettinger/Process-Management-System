import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ActivateCaseResponse,
  CaseDetailsResponse,
  CreateCaseRequest,
  CreateCaseResponse
} from '../models/case.model';
import { AddStakeholderRequest, StakeholdersResponse } from '../models/stakeholder.model';
import { buildApiUrl } from './api.config';

@Injectable({ providedIn: 'root' })
export class CasesApi {
  constructor(private readonly http: HttpClient) {}

  createCase(request: CreateCaseRequest): Observable<CreateCaseResponse> {
    return this.http.post<CreateCaseResponse>(buildApiUrl('/cases'), request);
  }

  getCase(caseId: string): Observable<CaseDetailsResponse> {
    return this.http.get<CaseDetailsResponse>(buildApiUrl(`/cases/${caseId}`));
  }

  addStakeholder(caseId: string, request: AddStakeholderRequest): Observable<StakeholdersResponse> {
    return this.http.post<StakeholdersResponse>(buildApiUrl(`/cases/${caseId}/stakeholders`), request);
  }

  activateCase(caseId: string): Observable<ActivateCaseResponse> {
    return this.http.post<ActivateCaseResponse>(buildApiUrl(`/cases/${caseId}/activate`), {});
  }
}
