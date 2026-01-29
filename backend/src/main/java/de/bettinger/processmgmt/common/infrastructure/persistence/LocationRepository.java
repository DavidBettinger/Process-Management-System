package de.bettinger.processmgmt.common.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationRepository extends JpaRepository<LocationEntity, UUID> {
	List<LocationEntity> findAllByTenantId(String tenantId);

	Optional<LocationEntity> findByIdAndTenantId(UUID id, String tenantId);
}
