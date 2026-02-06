import { toStakeholderRoleLabel } from './stakeholder-role-label';

describe('toStakeholderRoleLabel', () => {
  it('maps known role enums to German labels', () => {
    expect(toStakeholderRoleLabel('CONSULTANT')).toBe('Beratung');
    expect(toStakeholderRoleLabel('DIRECTOR')).toBe('Leitung');
    expect(toStakeholderRoleLabel('TEAM_MEMBER')).toBe('Teammitglied');
    expect(toStakeholderRoleLabel('SPONSOR')).toBe('Traeger');
    expect(toStakeholderRoleLabel('EXTERNAL')).toBe('Extern');
  });

  it('returns role fallback label for nullish and unknown values', () => {
    expect(toStakeholderRoleLabel(null)).toBe('Rolle offen');
    expect(toStakeholderRoleLabel(undefined)).toBe('Rolle offen');
    expect(toStakeholderRoleLabel('SOME_CUSTOM_ROLE')).toBe('SOME_CUSTOM_ROLE');
  });
});
