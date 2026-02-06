import { StakeholderRole } from '../../core/models/stakeholder.model';
// TODO: there should already exist another mapper, they should be merged into one
export const toStakeholderRoleLabel = (role: StakeholderRole | string | null | undefined): string => {
  switch (role) {
    case 'CONSULTANT':
      return 'Beratung';
    case 'DIRECTOR':
      return 'Leitung';
    case 'TEAM_MEMBER':
      return 'Teammitglied';
    case 'SPONSOR':
      return 'Traeger';
    case 'EXTERNAL':
      return 'Extern';
    case null:
    case undefined:
      return 'Rolle offen';
    default:
      return role;
  }
};
