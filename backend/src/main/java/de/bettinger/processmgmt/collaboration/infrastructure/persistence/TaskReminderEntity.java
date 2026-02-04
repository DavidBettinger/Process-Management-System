package de.bettinger.processmgmt.collaboration.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;

@Getter
@Entity
@Table(name = "task_reminders")
public class TaskReminderEntity {

	@Id
	@Column(name = "id", nullable = false)
	private UUID id;

	@Column(name = "task_id", nullable = false)
	private UUID taskId;

	@Column(name = "stakeholder_id", nullable = false)
	private UUID stakeholderId;

	@Column(name = "remind_at", nullable = false)
	private Instant remindAt;

	@Column(name = "note")
	private String note;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	protected TaskReminderEntity() {
	}

	public TaskReminderEntity(UUID id, UUID taskId, UUID stakeholderId, Instant remindAt, String note,
							 Instant createdAt) {
		this.id = id;
		this.taskId = taskId;
		this.stakeholderId = stakeholderId;
		this.remindAt = remindAt;
		this.note = note;
		this.createdAt = createdAt;
	}
}
