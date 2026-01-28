package de.bettinger.processmgmt.collaboration.infrastructure.persistence;

import de.bettinger.processmgmt.collaboration.domain.meeting.MeetingStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Entity
@Table(name = "meetings")
public class MeetingEntity {

	@Id
	@Column(name = "id", nullable = false)
	private UUID id;

	@Column(name = "case_id", nullable = false)
	private UUID caseId;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false)
	private MeetingStatus status;

	@Column(name = "scheduled_at")
	private Instant scheduledAt;

	@Column(name = "held_at")
	private Instant heldAt;

	@Column(name = "minutes_text")
	private String minutesText;

	protected MeetingEntity() {
	}

	public MeetingEntity(UUID id, UUID caseId, MeetingStatus status, Instant scheduledAt, Instant heldAt,
						 String minutesText) {
		this.id = id;
		this.caseId = caseId;
		this.status = status;
		this.scheduledAt = scheduledAt;
		this.heldAt = heldAt;
		this.minutesText = minutesText;
	}

}
