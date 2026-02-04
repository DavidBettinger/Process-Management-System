package de.bettinger.processmgmt.collaboration.infrastructure.persistence;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeetingRepository extends JpaRepository<MeetingEntity, UUID> {
	java.util.List<MeetingEntity> findAllByCaseIdOrderByScheduledAtDesc(UUID caseId);
}
