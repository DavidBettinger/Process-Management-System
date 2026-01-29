package de.bettinger.processmgmt.casemanagement.infrastructure.persistence;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KitaRepository extends JpaRepository<KitaEntity, UUID> {
}
