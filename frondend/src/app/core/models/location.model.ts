import { Address } from './address.model';

export interface Location {
  id: string;
  label: string;
  address: Address;
  tenantId?: string;
  createdAt?: string | null;
}

export interface CreateLocationRequest {
  label: string;
  address: Address;
}

export interface CreateLocationResponse {
  id: string;
}

export interface LocationsResponse {
  items: Location[];
}
