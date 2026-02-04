package de.bettinger.processmgmt.collaboration.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskReminderRepository extends JpaRepository<TaskReminderEntity, UUID> {
	List<TaskReminderEntity> findAllByTaskIdOrderByRemindAtAsc(UUID taskId);
	Optional<TaskReminderEntity> findByIdAndTaskId(UUID id, UUID taskId);
}
