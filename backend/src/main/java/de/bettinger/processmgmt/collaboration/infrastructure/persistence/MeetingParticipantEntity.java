package de.bettinger.processmgmt.collaboration.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "meeting_participants")
public class MeetingParticipantEntity {

	@EmbeddedId
	private MeetingParticipantId id;

	@MapsId("meetingId")
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "meeting_id", nullable = false)
	private MeetingEntity meeting;

	@Column(name = "user_id", nullable = false, insertable = false, updatable = false)
	private String userId;

	protected MeetingParticipantEntity() {
	}

	public MeetingParticipantEntity(MeetingEntity meeting, String userId) {
		this.meeting = meeting;
		this.id = new MeetingParticipantId(meeting.getId(), userId);
		this.userId = userId;
	}

	public MeetingParticipantId getId() {
		return id;
	}

	public String getUserId() {
		return userId;
	}
}
