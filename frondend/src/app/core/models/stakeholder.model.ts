export type RoleInCase = 'CONSULTANT' | 'DIRECTOR' | 'TEAM_MEMBER';
export type StakeholderRole = 'CONSULTANT' | 'DIRECTOR' | 'TEAM_MEMBER' | 'SPONSOR' | 'EXTERNAL';

export interface StakeholderResponse {
  userId: string;
  role: RoleInCase;
}

export interface Stakeholder {
  id: string;
  tenantId?: string;
  firstName: string;
  lastName: string;
  role: StakeholderRole;
  createdAt?: string | null;
}

export interface CreateStakeholderRequest {
  firstName: string;
  lastName: string;
  role: StakeholderRole;
}

export interface CreateStakeholderResponse {
  id: string;
}

export interface StakeholdersListResponse {
  items: Stakeholder[];
}

export interface StakeholdersResponse {
  caseId: string;
  stakeholders: StakeholderResponse[];
}

export interface AddStakeholderRequest {
  userId: string;
  role: RoleInCase;
}
