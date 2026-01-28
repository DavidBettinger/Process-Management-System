package de.bettinger.processmgmt.collaboration.application;

import de.bettinger.processmgmt.collaboration.domain.task.Task;
import de.bettinger.processmgmt.collaboration.domain.task.TaskResolutionKind;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskEntity;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskRepository;
import de.bettinger.processmgmt.common.outbox.OutboxEventEntity;
import de.bettinger.processmgmt.common.outbox.OutboxEventRepository;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskCommandService {

	private static final String AGGREGATE_TYPE = "Task";

	private final TaskRepository taskRepository;
	private final OutboxEventRepository outboxEventRepository;

	public TaskCommandService(TaskRepository taskRepository, OutboxEventRepository outboxEventRepository) {
		this.taskRepository = taskRepository;
		this.outboxEventRepository = outboxEventRepository;
	}

	@Transactional
	public TaskEntity createTask(UUID caseId, String title, String description) {
		Task task = Task.create(caseId, title, description);
		TaskEntity entity = TaskEntity.fromDomain(task);
		taskRepository.save(entity);
		outboxEventRepository.save(outboxEvent(task.getId(), "TaskCreated",
				"{\"taskId\":\"" + task.getId() + "\",\"caseId\":\"" + caseId + "\"}"));
		return entity;
	}

	@Transactional
	public TaskEntity assignTask(UUID taskId, String assigneeId) {
		TaskEntity entity = taskRepository.findById(taskId)
				.orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));
		Task task = entity.toDomain();
		task.assign(assigneeId);
		entity.applyFrom(task);
		taskRepository.save(entity);
		outboxEventRepository.save(outboxEvent(taskId, "TaskAssigned",
				"{\"taskId\":\"" + taskId + "\",\"assigneeId\":\"" + assigneeId + "\"}"));
		return entity;
	}

	@Transactional
	public TaskEntity resolveTask(UUID taskId, TaskResolutionKind kind, String reason, String resolvedBy) {
		TaskEntity entity = taskRepository.findById(taskId)
				.orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));
		Task task = entity.toDomain();
		task.resolve(kind, reason, resolvedBy);
		entity.applyFrom(task);
		taskRepository.save(entity);
		outboxEventRepository.save(outboxEvent(taskId, "TaskResolved",
				"{\"taskId\":\"" + taskId + "\",\"kind\":\"" + kind + "\"}"));
		return entity;
	}

	private OutboxEventEntity outboxEvent(UUID aggregateId, String eventType, String payload) {
		return new OutboxEventEntity(
				UUID.randomUUID(),
				AGGREGATE_TYPE,
				aggregateId.toString(),
				eventType,
				Instant.now(),
				payload,
				null,
				null
		);
	}
}
