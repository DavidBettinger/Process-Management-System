package de.bettinger.processmgmt.collaboration.infrastructure.persistence;

import de.bettinger.processmgmt.collaboration.domain.task.TaskResolutionKind;
import de.bettinger.processmgmt.collaboration.domain.task.TaskState;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Entity
@Table(name = "tasks")
public class TaskEntity {

	@Id
	@Column(name = "id", nullable = false)
	private UUID id;

	@Column(name = "case_id", nullable = false)
	private UUID caseId;

	@Column(name = "origin_meeting_id")
	private UUID originMeetingId;

	@Column(name = "title", nullable = false)
	private String title;

	@Column(name = "description", nullable = false)
	private String description;

	@Column(name = "due_date")
	private LocalDate dueDate;

	@Column(name = "assignee_id")
	private String assigneeId;

	@Enumerated(EnumType.STRING)
	@Column(name = "state", nullable = false)
	private TaskState state;

	@Enumerated(EnumType.STRING)
	@Column(name = "resolution_kind")
	private TaskResolutionKind resolutionKind;

	@Column(name = "resolution_reason")
	private String resolutionReason;

	@Column(name = "resolved_by")
	private String resolvedBy;

	@Column(name = "resolved_at")
	private Instant resolvedAt;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	protected TaskEntity() {
	}

	public TaskEntity(UUID id, UUID caseId, UUID originMeetingId, String title, String description, LocalDate dueDate,
					 String assigneeId, TaskState state, TaskResolutionKind resolutionKind, String resolutionReason,
					 String resolvedBy, Instant resolvedAt, Instant createdAt) {
		this.id = id;
		this.caseId = caseId;
		this.originMeetingId = originMeetingId;
		this.title = title;
		this.description = description;
		this.dueDate = dueDate;
		this.assigneeId = assigneeId;
		this.state = state;
		this.resolutionKind = resolutionKind;
		this.resolutionReason = resolutionReason;
		this.resolvedBy = resolvedBy;
		this.resolvedAt = resolvedAt;
		this.createdAt = createdAt;
	}

}
