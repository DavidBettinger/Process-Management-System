package de.bettinger.processmgmt.common.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StakeholderRepository extends JpaRepository<StakeholderEntity, UUID> {
	List<StakeholderEntity> findByTenantId(String tenantId);
	Page<StakeholderEntity> findByTenantId(String tenantId, Pageable pageable);
	Optional<StakeholderEntity> findByIdAndTenantId(UUID id, String tenantId);
}
