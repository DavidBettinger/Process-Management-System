import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { buildApiUrl } from './api.config';
import { CreateKitaRequest, CreateKitaResponse, Kita, KitasResponse } from '../models/kita.model';

@Injectable({ providedIn: 'root' })
export class KitasApi {
  constructor(private readonly http: HttpClient) {}

  createKita(request: CreateKitaRequest): Observable<CreateKitaResponse> {
    return this.http.post<CreateKitaResponse>(buildApiUrl('/kitas'), request);
  }

  listKitas(): Observable<KitasResponse> {
    return this.http.get<KitasResponse>(buildApiUrl('/kitas'));
  }

  getKita(kitaId: string): Observable<Kita> {
    return this.http.get<Kita>(buildApiUrl(`/kitas/${kitaId}`));
  }
}
