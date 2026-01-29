package de.bettinger.processmgmt.casemanagement.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KitaRepository extends JpaRepository<KitaEntity, UUID> {
	List<KitaEntity> findAllByTenantId(String tenantId);

	Optional<KitaEntity> findByIdAndTenantId(UUID id, String tenantId);
}
