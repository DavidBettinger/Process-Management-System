package de.bettinger.processmgmt.collaboration.application;

import de.bettinger.processmgmt.collaboration.domain.task.Task;
import de.bettinger.processmgmt.collaboration.domain.task.TaskResolutionKind;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskEntity;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskRepository;
import de.bettinger.processmgmt.common.errors.NotFoundException;
import de.bettinger.processmgmt.common.outbox.OutboxEventEntity;
import de.bettinger.processmgmt.common.outbox.OutboxEventRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
		return createTask(caseId, title, description, priority, dueDate, assigneeId, null, List.of());
	}

	@Transactional
	public TaskEntity createTask(UUID caseId, String title, String description, int priority,
								 java.time.LocalDate dueDate, String assigneeId, UUID createdFromMeetingId) {
		return createTask(caseId, title, description, priority, dueDate, assigneeId, createdFromMeetingId, List.of());
	}

	@Transactional
	public TaskEntity createTask(UUID caseId, String title, String description, int priority,
								 java.time.LocalDate dueDate, String assigneeId, UUID createdFromMeetingId,
								 List<UUID> dependsOnTaskIds) {
		String normalizedAssigneeId = normalizeAssigneeId(assigneeId);
		Task task = Task.create(caseId, title, description, priority);
		List<UUID> normalizedDependencyIds = normalizeDependencyIds(dependsOnTaskIds);
		validateDependencies(task.getId(), caseId, normalizedDependencyIds);
		if (normalizedAssigneeId != null) {
			task.assign(normalizedAssigneeId);
		}
		TaskEntity entity = TaskEntity.fromDomain(task);
		entity.setDueDate(dueDate);
		entity.setOriginMeetingId(createdFromMeetingId);
		entity.setCreatedFromMeetingId(createdFromMeetingId);
		entity.replaceDependsOnTaskIds(normalizedDependencyIds);
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
	public TaskEntity updateTaskDependencies(UUID taskId, List<UUID> dependsOnTaskIds) {
		TaskEntity entity = taskRepository.findById(taskId)
				.orElseThrow(() -> new NotFoundException("Task not found: " + taskId));
		List<UUID> normalizedDependencyIds = normalizeDependencyIds(dependsOnTaskIds);
		validateDependencies(taskId, entity.getCaseId(), normalizedDependencyIds);
		entity.replaceDependsOnTaskIds(normalizedDependencyIds);
		return taskRepository.save(entity);
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

	private List<UUID> normalizeDependencyIds(List<UUID> dependencyIds) {
		if (dependencyIds == null) {
			return List.of();
		}
		List<UUID> normalized = new ArrayList<>(dependencyIds.size());
		for (UUID dependencyId : dependencyIds) {
			if (dependencyId == null) {
				throw new IllegalArgumentException("dependsOnTaskIds must not contain null values");
			}
			normalized.add(dependencyId);
		}
		return normalized;
	}

	private void validateDependencies(UUID taskId, UUID caseId, List<UUID> dependencyIds) {
		Set<UUID> uniqueDependencyIds = new LinkedHashSet<>(dependencyIds);
		if (uniqueDependencyIds.size() != dependencyIds.size()) {
			throw new IllegalArgumentException("dependsOnTaskIds must contain unique task ids");
		}
		if (uniqueDependencyIds.contains(taskId)) {
			throw new IllegalArgumentException("A task cannot depend on itself");
		}
		validateDependencyTargets(caseId, uniqueDependencyIds);
		validateNoCycles(taskId, caseId, uniqueDependencyIds);
	}

	private void validateDependencyTargets(UUID caseId, Set<UUID> dependencyIds) {
		if (dependencyIds.isEmpty()) {
			return;
		}
		List<TaskEntity> dependencies = taskRepository.findAllById(dependencyIds);
		Set<UUID> foundIds = new LinkedHashSet<>();
		for (TaskEntity dependency : dependencies) {
			foundIds.add(dependency.getId());
			if (!dependency.getCaseId().equals(caseId)) {
				throw new IllegalArgumentException("All dependencies must belong to the same case");
			}
		}
		if (foundIds.size() != dependencyIds.size()) {
			throw new IllegalArgumentException("All dependsOnTaskIds must reference existing tasks");
		}
	}

	private void validateNoCycles(UUID taskId, UUID caseId, Set<UUID> dependencyIds) {
		Map<UUID, Set<UUID>> graph = buildDependencyGraph(caseId);
		graph.put(taskId, new LinkedHashSet<>(dependencyIds));
		if (hasCycleFromTask(taskId, graph)) {
			throw new IllegalArgumentException("Task dependencies must not contain cycles");
		}
	}

	private Map<UUID, Set<UUID>> buildDependencyGraph(UUID caseId) {
		Map<UUID, Set<UUID>> graph = new HashMap<>();
		List<TaskEntity> caseTasks = taskRepository.findAllByCaseIdOrderByCreatedAtDesc(caseId);
		for (TaskEntity task : caseTasks) {
			graph.put(task.getId(), new LinkedHashSet<>(task.getDependsOnTaskIds()));
		}
		return graph;
	}

	private boolean hasCycleFromTask(UUID startTaskId, Map<UUID, Set<UUID>> graph) {
		return detectCycle(startTaskId, graph, new LinkedHashSet<>(), new LinkedHashSet<>());
	}

	private boolean detectCycle(UUID currentTaskId, Map<UUID, Set<UUID>> graph, Set<UUID> visiting, Set<UUID> visited) {
		if (visited.contains(currentTaskId)) {
			return false;
		}
		if (!visiting.add(currentTaskId)) {
			return true;
		}
		for (UUID dependencyId : graph.getOrDefault(currentTaskId, Set.of())) {
			if (detectCycle(dependencyId, graph, visiting, visited)) {
				return true;
			}
		}
		visiting.remove(currentTaskId);
		visited.add(currentTaskId);
		return false;
	}
}
