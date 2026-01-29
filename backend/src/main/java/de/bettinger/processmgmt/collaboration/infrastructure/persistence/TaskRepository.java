package de.bettinger.processmgmt.collaboration.infrastructure.persistence;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<TaskEntity, UUID> {
	java.util.List<TaskEntity> findAllByOriginMeetingId(UUID originMeetingId);
	java.util.List<TaskEntity> findAllByCaseIdOrderByCreatedAtDesc(UUID caseId);
}
