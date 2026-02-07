package de.bettinger.processmgmt.collaboration.application;

import de.bettinger.processmgmt.collaboration.domain.task.TaskState;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskEntity;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
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

	public List<UUID> blockedByTaskIds(TaskEntity task) {
		if (task.getDependsOnTaskIds().isEmpty()) {
			return List.of();
		}
		Map<UUID, TaskState> stateById = taskRepository.findAllById(task.getDependsOnTaskIds()).stream()
				.collect(Collectors.toMap(TaskEntity::getId, TaskEntity::getState));
		return blockedByTaskIds(task, stateById);
	}

	public List<UUID> blockedByTaskIds(TaskEntity task, Map<UUID, TaskState> taskStateById) {
		List<UUID> blockedBy = new ArrayList<>();
		for (UUID dependencyId : task.getDependsOnTaskIds()) {
			TaskState dependencyState = taskStateById.get(dependencyId);
			if (dependencyState != TaskState.RESOLVED) {
				blockedBy.add(dependencyId);
			}
		}
		return blockedBy;
	}

	public Map<UUID, TaskState> taskStateById(List<TaskEntity> tasks) {
		return tasks.stream()
				.collect(Collectors.toMap(TaskEntity::getId, TaskEntity::getState, (left, right) -> right,
						java.util.LinkedHashMap::new));
	}
}
