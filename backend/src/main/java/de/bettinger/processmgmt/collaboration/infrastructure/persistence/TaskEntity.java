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
import lombok.Setter;

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

	@Setter
    @Column(name = "origin_meeting_id")
	private UUID originMeetingId;

	@Setter
    @Column(name = "created_from_meeting_id")
	private UUID createdFromMeetingId;

	@Column(name = "title", nullable = false)
	private String title;

	@Column(name = "description", nullable = false)
	private String description;

	@Column(name = "priority", nullable = false)
	private int priority;

	@Setter
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

	@Column(name = "last_decline_reason")
	private String lastDeclineReason;

	@Column(name = "last_suggested_assignee_id")
	private String lastSuggestedAssigneeId;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	protected TaskEntity() {
	}

	public static TaskEntity fromDomain(de.bettinger.processmgmt.collaboration.domain.task.Task task) {
		return new TaskEntity(
				task.getId(),
				task.getCaseId(),
				null,
				task.getTitle(),
				task.getDescription(),
				null,
				task.getPriority(),
				task.getAssigneeId(),
				task.getState(),
				task.getResolutionKind(),
				task.getResolutionReason(),
				task.getResolvedBy(),
				task.getResolvedAt(),
				task.getLastDeclineReason(),
				task.getLastSuggestedAssigneeId(),
				task.getCreatedAt()
		);
	}

	public de.bettinger.processmgmt.collaboration.domain.task.Task toDomain() {
		return de.bettinger.processmgmt.collaboration.domain.task.Task.rehydrate(
				id,
				caseId,
				title,
				description,
				priority,
				state,
				assigneeId,
				resolutionKind,
				resolutionReason,
				resolvedBy,
				resolvedAt,
				lastDeclineReason,
				lastSuggestedAssigneeId,
				createdAt
		);
	}

	public void applyFrom(de.bettinger.processmgmt.collaboration.domain.task.Task task) {
		if (!id.equals(task.getId())) {
			throw new IllegalArgumentException("Task identity mismatch");
		}
		this.assigneeId = task.getAssigneeId();
		this.state = task.getState();
		this.resolutionKind = task.getResolutionKind();
		this.resolutionReason = task.getResolutionReason();
		this.resolvedBy = task.getResolvedBy();
		this.resolvedAt = task.getResolvedAt();
		this.lastDeclineReason = task.getLastDeclineReason();
		this.lastSuggestedAssigneeId = task.getLastSuggestedAssigneeId();
	}

    public TaskEntity(UUID id, UUID caseId, UUID originMeetingId, String title, String description, LocalDate dueDate,
					 int priority, String assigneeId, TaskState state, TaskResolutionKind resolutionKind,
					 String resolutionReason, String resolvedBy, Instant resolvedAt, String lastDeclineReason,
					 String lastSuggestedAssigneeId, Instant createdAt) {
		this(
				id,
				caseId,
				originMeetingId,
				null,
				title,
				description,
				dueDate,
				priority,
				assigneeId,
				state,
				resolutionKind,
				resolutionReason,
				resolvedBy,
				resolvedAt,
				lastDeclineReason,
				lastSuggestedAssigneeId,
				createdAt
		);
	}

	public TaskEntity(UUID id, UUID caseId, UUID originMeetingId, UUID createdFromMeetingId, String title,
					 String description, LocalDate dueDate, int priority, String assigneeId, TaskState state,
					 TaskResolutionKind resolutionKind, String resolutionReason, String resolvedBy, Instant resolvedAt,
					 String lastDeclineReason, String lastSuggestedAssigneeId, Instant createdAt) {
		this.id = id;
		this.caseId = caseId;
		this.originMeetingId = originMeetingId;
		this.createdFromMeetingId = createdFromMeetingId;
		this.title = title;
		this.description = description;
		this.priority = priority;
		this.dueDate = dueDate;
		this.assigneeId = assigneeId;
		this.state = state;
		this.resolutionKind = resolutionKind;
		this.resolutionReason = resolutionReason;
		this.resolvedBy = resolvedBy;
		this.resolvedAt = resolvedAt;
		this.lastDeclineReason = lastDeclineReason;
		this.lastSuggestedAssigneeId = lastSuggestedAssigneeId;
		this.createdAt = createdAt;
	}

}
