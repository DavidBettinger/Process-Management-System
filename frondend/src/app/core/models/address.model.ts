export interface Address {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country?: string | null;
}
