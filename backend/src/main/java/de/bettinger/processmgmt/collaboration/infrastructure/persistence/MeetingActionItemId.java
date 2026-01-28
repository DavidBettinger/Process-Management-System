package de.bettinger.processmgmt.collaboration.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class MeetingActionItemId implements Serializable {

	@Column(name = "meeting_id", nullable = false)
	private UUID meetingId;

	@Column(name = "item_key", nullable = false)
	private String itemKey;

	protected MeetingActionItemId() {
	}

	public MeetingActionItemId(UUID meetingId, String itemKey) {
		this.meetingId = meetingId;
		this.itemKey = itemKey;
	}

	public UUID getMeetingId() {
		return meetingId;
	}

	public String getItemKey() {
		return itemKey;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) {
			return true;
		}
		if (!(o instanceof MeetingActionItemId that)) {
			return false;
		}
		return Objects.equals(meetingId, that.meetingId)
				&& Objects.equals(itemKey, that.itemKey);
	}

	@Override
	public int hashCode() {
		return Objects.hash(meetingId, itemKey);
	}
}
