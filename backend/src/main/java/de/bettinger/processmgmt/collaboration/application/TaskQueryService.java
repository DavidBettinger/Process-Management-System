package de.bettinger.processmgmt.collaboration.application;

import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskEntity;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class TaskQueryService {

	private final TaskRepository taskRepository;

	public TaskQueryService(TaskRepository taskRepository) {
		this.taskRepository = taskRepository;
	}

	public List<TaskEntity> listTasks(UUID caseId) {
		return taskRepository.findAllByCaseIdOrderByCreatedAtDesc(caseId);
	}
}
