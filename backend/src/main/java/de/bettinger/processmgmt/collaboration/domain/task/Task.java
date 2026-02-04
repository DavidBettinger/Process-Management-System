package de.bettinger.processmgmt.collaboration.domain.task;

import lombok.Getter;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Getter
public class Task {

	public static final int MIN_PRIORITY = 1;
	public static final int MAX_PRIORITY = 5;
	public static final int DEFAULT_PRIORITY = 3;
	private static final int MAX_DESCRIPTION_LENGTH = 10_000;

	private final UUID id;
	private final UUID caseId;
	private final String title;
	private final String description;
	private final int priority;
	private final Instant createdAt;
	private TaskState state;
	private String assigneeId;
	private TaskResolutionKind resolutionKind;
	private String resolutionReason;
	private String resolvedBy;
	private Instant resolvedAt;
	private String lastDeclineReason;
	private String lastSuggestedAssigneeId;

	private Task(UUID id, UUID caseId, String title, String description, int priority, Instant createdAt) {
		this.id = Objects.requireNonNull(id, "id");
		this.caseId = Objects.requireNonNull(caseId, "caseId");
		this.title = Objects.requireNonNull(title, "title");
		this.description = normalizeDescription(description);
		this.priority = validatePriority(priority);
		this.createdAt = Objects.requireNonNull(createdAt, "createdAt");
		this.state = TaskState.OPEN;
	}

	public static Task rehydrate(UUID id, UUID caseId, String title, String description, int priority, TaskState state,
			String assigneeId, TaskResolutionKind resolutionKind, String resolutionReason, String resolvedBy,
			Instant resolvedAt, String lastDeclineReason, String lastSuggestedAssigneeId, Instant createdAt) {
		Task task = new Task(id, caseId, title, description, priority, createdAt);
		task.state = Objects.requireNonNull(state, "state");
		task.assigneeId = assigneeId;
		task.resolutionKind = resolutionKind;
		task.resolutionReason = resolutionReason;
		task.resolvedBy = resolvedBy;
		task.resolvedAt = resolvedAt;
		task.lastDeclineReason = lastDeclineReason;
		task.lastSuggestedAssigneeId = lastSuggestedAssigneeId;
		return task;
	}

	public static Task create(UUID caseId, String title, String description, int priority) {
		return new Task(UUID.randomUUID(), caseId, title, description, priority, Instant.now());
	}

	public void assign(String assigneeId) {
		requireState(TaskState.OPEN);
		this.assigneeId = Objects.requireNonNull(assigneeId, "assigneeId");
		this.state = TaskState.ASSIGNED;
	}

	public void start() {
		requireState(TaskState.ASSIGNED);
		this.state = TaskState.IN_PROGRESS;
	}

	public void block(String reason) {
		requireState(TaskState.IN_PROGRESS);
		Objects.requireNonNull(reason, "reason");
		this.state = TaskState.BLOCKED;
	}

	public void unblock() {
		requireState(TaskState.BLOCKED);
		this.state = TaskState.IN_PROGRESS;
	}

	public void declineAssignment(String reason, String suggestedAssigneeId) {
		requireState(TaskState.ASSIGNED);
		Objects.requireNonNull(reason, "reason");
		this.lastDeclineReason = reason;
		this.lastSuggestedAssigneeId = suggestedAssigneeId;
		this.assigneeId = null;
		this.state = TaskState.OPEN;
	}

	public void resolve(TaskResolutionKind kind, String reason, String resolvedBy) {
		if (state == TaskState.RESOLVED) {
			throw new IllegalStateException("Task is already resolved");
		}
		this.resolutionKind = Objects.requireNonNull(kind, "kind");
		this.resolutionReason = Objects.requireNonNull(reason, "reason");
		this.resolvedBy = Objects.requireNonNull(resolvedBy, "resolvedBy");
		this.resolvedAt = Instant.now();
		this.state = TaskState.RESOLVED;
	}

	private void requireState(TaskState expected) {
		if (state != expected) {
			throw new IllegalStateException("Expected state " + expected + " but was " + state);
		}
	}

	private static int validatePriority(int priority) {
		if (priority < MIN_PRIORITY || priority > MAX_PRIORITY) {
			throw new IllegalArgumentException("priority must be between " + MIN_PRIORITY + " and " + MAX_PRIORITY);
		}
		return priority;
	}

	private static String normalizeDescription(String description) {
		String normalized = description == null ? "" : description;
		if (normalized.length() > MAX_DESCRIPTION_LENGTH) {
			throw new IllegalArgumentException(
					"description must be at most " + MAX_DESCRIPTION_LENGTH + " characters");
		}
		return normalized;
	}

}
