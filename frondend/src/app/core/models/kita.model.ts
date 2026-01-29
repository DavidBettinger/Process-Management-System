export interface Kita {
  id: string;
  name: string;
  locationId: string;
  tenantId?: string;
  createdAt?: string | null;
}

export interface CreateKitaRequest {
  name: string;
  locationId: string;
}

export interface CreateKitaResponse {
  id: string;
}

export interface KitasResponse {
  items: Kita[];
}
