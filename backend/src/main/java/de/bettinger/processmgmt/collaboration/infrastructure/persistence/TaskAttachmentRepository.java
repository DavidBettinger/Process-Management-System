package de.bettinger.processmgmt.collaboration.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskAttachmentRepository extends JpaRepository<TaskAttachmentEntity, UUID> {
	List<TaskAttachmentEntity> findAllByTaskIdOrderByUploadedAtDesc(UUID taskId);
	Optional<TaskAttachmentEntity> findByIdAndTaskId(UUID id, UUID taskId);
}
