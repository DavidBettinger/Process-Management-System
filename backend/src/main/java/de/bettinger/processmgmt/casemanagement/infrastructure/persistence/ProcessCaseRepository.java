package de.bettinger.processmgmt.casemanagement.infrastructure.persistence;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProcessCaseRepository extends JpaRepository<ProcessCaseEntity, UUID> {
	java.util.List<ProcessCaseEntity> findAllByTenantIdOrderByCreatedAtDesc(String tenantId);
	java.util.Optional<ProcessCaseEntity> findByIdAndTenantId(UUID id, String tenantId);
}
