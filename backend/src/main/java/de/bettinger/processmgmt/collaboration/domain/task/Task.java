package de.bettinger.processmgmt.collaboration.domain.task;

import lombok.Getter;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Getter
public class Task {

	private final UUID id;
	private final UUID caseId;
	private final String title;
	private final String description;
	private final Instant createdAt;
	private TaskState state;
	private String assigneeId;
	private TaskResolutionKind resolutionKind;
	private String resolutionReason;
	private String resolvedBy;
	private Instant resolvedAt;
	private String lastDeclineReason;
	private String lastSuggestedAssigneeId;

	private Task(UUID id, UUID caseId, String title, String description, Instant createdAt) {
		this.id = Objects.requireNonNull(id, "id");
		this.caseId = Objects.requireNonNull(caseId, "caseId");
		this.title = Objects.requireNonNull(title, "title");
		this.description = Objects.requireNonNull(description, "description");
		this.createdAt = Objects.requireNonNull(createdAt, "createdAt");
		this.state = TaskState.OPEN;
	}

	public static Task create(UUID caseId, String title, String description) {
		return new Task(UUID.randomUUID(), caseId, title, description == null ? "" : description, Instant.now());
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

}
