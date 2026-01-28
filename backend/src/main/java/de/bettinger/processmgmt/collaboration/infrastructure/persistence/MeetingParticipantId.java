package de.bettinger.processmgmt.collaboration.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class MeetingParticipantId implements Serializable {

	@Column(name = "meeting_id", nullable = false)
	private UUID meetingId;

	@Column(name = "user_id", nullable = false)
	private String userId;

	protected MeetingParticipantId() {
	}

	public MeetingParticipantId(UUID meetingId, String userId) {
		this.meetingId = meetingId;
		this.userId = userId;
	}

	public UUID getMeetingId() {
		return meetingId;
	}

	public String getUserId() {
		return userId;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) {
			return true;
		}
		if (!(o instanceof MeetingParticipantId that)) {
			return false;
		}
		return Objects.equals(meetingId, that.meetingId)
				&& Objects.equals(userId, that.userId);
	}

	@Override
	public int hashCode() {
		return Objects.hash(meetingId, userId);
	}
}
