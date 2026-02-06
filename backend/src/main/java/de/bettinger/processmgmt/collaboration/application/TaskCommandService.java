package de.bettinger.processmgmt.collaboration.application;

import de.bettinger.processmgmt.collaboration.domain.task.Task;
import de.bettinger.processmgmt.collaboration.domain.task.TaskResolutionKind;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskEntity;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskRepository;
import de.bettinger.processmgmt.common.errors.NotFoundException;
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
	public TaskEntity createTask(UUID caseId, String title, String description, int priority,
								 java.time.LocalDate dueDate, String assigneeId) {
		return createTask(caseId, title, description, priority, dueDate, assigneeId, null);
	}

	@Transactional
	public TaskEntity createTask(UUID caseId, String title, String description, int priority,
								 java.time.LocalDate dueDate, String assigneeId, UUID createdFromMeetingId) {
		String normalizedAssigneeId = normalizeAssigneeId(assigneeId);
		Task task = Task.create(caseId, title, description, priority);
		if (normalizedAssigneeId != null) {
			task.assign(normalizedAssigneeId);
		}
		TaskEntity entity = TaskEntity.fromDomain(task);
		entity.setDueDate(dueDate);
		entity.setOriginMeetingId(createdFromMeetingId);
		entity.setCreatedFromMeetingId(createdFromMeetingId);
		taskRepository.save(entity);
		outboxEventRepository.save(outboxEvent(task.getId(), "TaskCreated",
				"{\"taskId\":\"" + task.getId() + "\",\"caseId\":\"" + caseId + "\"}"));
		if (normalizedAssigneeId != null) {
			outboxEventRepository.save(outboxEvent(task.getId(), "TaskAssigned",
					"{\"taskId\":\"" + task.getId() + "\",\"caseId\":\"" + caseId + "\",\"assigneeId\":\""
							+ normalizedAssigneeId + "\"}"));
		}
		return entity;
	}

	@Transactional
	public TaskEntity assignTask(UUID taskId, String assigneeId) {
		TaskEntity entity = taskRepository.findById(taskId)
				.orElseThrow(() -> new NotFoundException("Task not found: " + taskId));
		Task task = entity.toDomain();
		task.assign(assigneeId);
		entity.applyFrom(task);
		taskRepository.save(entity);
		outboxEventRepository.save(outboxEvent(taskId, "TaskAssigned",
				"{\"taskId\":\"" + taskId + "\",\"caseId\":\"" + entity.getCaseId() + "\",\"assigneeId\":\""
						+ assigneeId + "\"}"));
		return entity;
	}

	@Transactional
	public TaskEntity resolveTask(UUID taskId, TaskResolutionKind kind, String reason, String resolvedBy) {
		TaskEntity entity = taskRepository.findById(taskId)
				.orElseThrow(() -> new NotFoundException("Task not found: " + taskId));
		Task task = entity.toDomain();
		task.resolve(kind, reason, resolvedBy);
		entity.applyFrom(task);
		taskRepository.save(entity);
		outboxEventRepository.save(outboxEvent(taskId, "TaskResolved",
				"{\"taskId\":\"" + taskId + "\",\"caseId\":\"" + entity.getCaseId() + "\",\"kind\":\"" + kind + "\"}"));
		return entity;
	}

	@Transactional
	public TaskEntity startTask(UUID taskId) {
		TaskEntity entity = taskRepository.findById(taskId)
				.orElseThrow(() -> new NotFoundException("Task not found: " + taskId));
		Task task = entity.toDomain();
		task.start();
		entity.applyFrom(task);
		return taskRepository.save(entity);
	}

	@Transactional
	public TaskEntity blockTask(UUID taskId, String reason) {
		TaskEntity entity = taskRepository.findById(taskId)
				.orElseThrow(() -> new NotFoundException("Task not found: " + taskId));
		Task task = entity.toDomain();
		task.block(reason);
		entity.applyFrom(task);
		return taskRepository.save(entity);
	}

	@Transactional
	public TaskEntity unblockTask(UUID taskId) {
		TaskEntity entity = taskRepository.findById(taskId)
				.orElseThrow(() -> new NotFoundException("Task not found: " + taskId));
		Task task = entity.toDomain();
		task.unblock();
		entity.applyFrom(task);
		return taskRepository.save(entity);
	}

	@Transactional
	public TaskEntity declineAssignment(UUID taskId, String reason, String suggestedAssigneeId) {
		TaskEntity entity = taskRepository.findById(taskId)
				.orElseThrow(() -> new NotFoundException("Task not found: " + taskId));
		Task task = entity.toDomain();
		task.declineAssignment(reason, suggestedAssigneeId);
		entity.applyFrom(task);
		return taskRepository.save(entity);
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

	private String normalizeAssigneeId(String assigneeId) {
		if (assigneeId == null) {
			return null;
		}
		String normalized = assigneeId.trim();
		return normalized.isEmpty() ? null : normalized;
	}
}
