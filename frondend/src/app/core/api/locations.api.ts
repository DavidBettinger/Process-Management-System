import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { buildApiUrl } from './api.config';
import {
  CreateLocationRequest,
  CreateLocationResponse,
  Location,
  LocationsResponse
} from '../models/location.model';

@Injectable({ providedIn: 'root' })
export class LocationsApi {
  constructor(private readonly http: HttpClient) {}

  createLocation(request: CreateLocationRequest): Observable<CreateLocationResponse> {
    return this.http.post<CreateLocationResponse>(buildApiUrl('/locations'), request);
  }

  listLocations(): Observable<LocationsResponse> {
    return this.http.get<LocationsResponse>(buildApiUrl('/locations'));
  }

  getLocation(locationId: string): Observable<Location> {
    return this.http.get<Location>(buildApiUrl(`/locations/${locationId}`));
  }
}
