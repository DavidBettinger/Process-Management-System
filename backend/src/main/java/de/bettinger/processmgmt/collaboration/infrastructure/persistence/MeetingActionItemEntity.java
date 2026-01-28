package de.bettinger.processmgmt.collaboration.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "meeting_action_items")
public class MeetingActionItemEntity {

	@Getter
    @EmbeddedId
	private MeetingActionItemId id;

	@MapsId("meetingId")
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "meeting_id", nullable = false)
	private MeetingEntity meeting;

	@Getter
    @Column(name = "title", nullable = false)
	private String title;

	@Getter
    @Column(name = "assignee_id")
	private String assigneeId;

	@Getter
    @Column(name = "due_date")
	private LocalDate dueDate;

	@Getter
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

    public String getItemKey() {
		return id.getItemKey();
	}

}
