package de.bettinger.processmgmt.casemanagement.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CaseStakeholderRepository extends JpaRepository<CaseStakeholderEntity, CaseStakeholderId> {
}
