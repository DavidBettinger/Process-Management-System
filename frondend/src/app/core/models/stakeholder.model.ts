export type RoleInCase = 'CONSULTANT' | 'DIRECTOR' | 'TEAM_MEMBER';

export interface StakeholderResponse {
  userId: string;
  role: RoleInCase;
}

export interface StakeholdersResponse {
  caseId: string;
  stakeholders: StakeholderResponse[];
}

export interface AddStakeholderRequest {
  userId: string;
  role: RoleInCase;
}
