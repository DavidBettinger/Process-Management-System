package de.bettinger.processmgmt.collaboration.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "meeting_action_items")
public class MeetingActionItemEntity {

	@EmbeddedId
	private MeetingActionItemId id;

	@MapsId("meetingId")
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "meeting_id", nullable = false)
	private MeetingEntity meeting;

	@Column(name = "title", nullable = false)
	private String title;

	@Column(name = "assignee_id")
	private String assigneeId;

	@Column(name = "due_date")
	private LocalDate dueDate;

	@Column(name = "created_task_id")
	private UUID createdTaskId;

	protected MeetingActionItemEntity() {
	}

	public MeetingActionItemEntity(MeetingEntity meeting, String itemKey, String title, String assigneeId,
								 LocalDate dueDate, UUID createdTaskId) {
		this.meeting = meeting;
		this.id = new MeetingActionItemId(meeting.getId(), itemKey);
		this.title = title;
		this.assigneeId = assigneeId;
		this.dueDate = dueDate;
		this.createdTaskId = createdTaskId;
	}

	public MeetingActionItemId getId() {
		return id;
	}

	public String getTitle() {
		return title;
	}

	public String getAssigneeId() {
		return assigneeId;
	}

	public LocalDate getDueDate() {
		return dueDate;
	}

	public UUID getCreatedTaskId() {
		return createdTaskId;
	}
}
