import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { buildApiUrl } from './api.config';
import {
  CreateStakeholderRequest,
  CreateStakeholderResponse,
  StakeholdersListResponse
} from '../models/stakeholder.model';
import { StakeholderTasksResponse } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class StakeholdersApi {
  constructor(private readonly http: HttpClient) {}

  createStakeholder(request: CreateStakeholderRequest): Observable<CreateStakeholderResponse> {
    return this.http.post<CreateStakeholderResponse>(buildApiUrl('/stakeholders'), request);
  }

  getStakeholders(page = 0, size = 20, sort?: string): Observable<StakeholdersListResponse> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (sort) {
      params = params.set('sort', sort);
    }
    return this.http.get<StakeholdersListResponse>(buildApiUrl('/stakeholders'), { params });
  }

  getStakeholderTasks(
    stakeholderId: string,
    page = 0,
    size = 20,
    sort?: string
  ): Observable<StakeholderTasksResponse> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (sort) {
      params = params.set('sort', sort);
    }
    return this.http.get<StakeholderTasksResponse>(
      buildApiUrl(`/stakeholders/${stakeholderId}/tasks`),
      { params }
    );
  }
}
