import { StakeholderResponse } from './stakeholder.model';

export type CaseStatus = 'DRAFT' | 'ACTIVE';

export interface CreateCaseRequest {
  title: string;
  kitaId: string;
}

export interface CreateCaseResponse {
  id: string;
  status: CaseStatus;
}

export interface ActivateCaseResponse {
  id: string;
  status: CaseStatus;
}

export interface CaseDetailsResponse {
  id: string;
  tenantId: string;
  title: string;
  kitaId: string;
  status: CaseStatus;
  stakeholders: StakeholderResponse[];
  createdAt: string;
}

export interface CasesResponse {
  items: CaseDetailsResponse[];
}

export type ProcessCase = CaseDetailsResponse;
