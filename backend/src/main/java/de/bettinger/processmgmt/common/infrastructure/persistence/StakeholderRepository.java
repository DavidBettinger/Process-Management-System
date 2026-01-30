package de.bettinger.processmgmt.common.infrastructure.persistence;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StakeholderRepository extends JpaRepository<StakeholderEntity, UUID> {
	List<StakeholderEntity> findByTenantId(String tenantId);
}
