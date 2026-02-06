package de.bettinger.processmgmt.collaboration.infrastructure.persistence;

import de.bettinger.processmgmt.collaboration.domain.meeting.MeetingStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
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

	@Setter
    @Column(name = "location_id", nullable = false)
	private UUID locationId;

	@Setter
    @Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false)
	private MeetingStatus status;

	@Column(name = "title", nullable = false, length = 200)
	private String title;

	@Column(name = "description")
	private String description;

	@Column(name = "scheduled_at")
	private Instant scheduledAt;

	@Setter
    @Column(name = "held_at")
	private Instant heldAt;

	@Setter
    @Column(name = "minutes_text")
	private String minutesText;

	@OneToMany(mappedBy = "meeting", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true,
			fetch = FetchType.EAGER)
	private final List<MeetingParticipantEntity> participants = new ArrayList<>();

	@OneToMany(mappedBy = "meeting", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true,
			fetch = FetchType.EAGER)
	private final List<MeetingActionItemEntity> actionItems = new ArrayList<>();

	protected MeetingEntity() {
	}

	public MeetingEntity(UUID id, UUID caseId, UUID locationId, MeetingStatus status, String title, String description,
						 Instant scheduledAt, Instant heldAt, String minutesText) {
		this.id = id;
		this.caseId = caseId;
		this.locationId = locationId;
		this.status = status;
		this.title = title;
		this.description = description;
		this.scheduledAt = scheduledAt;
		this.heldAt = heldAt;
		this.minutesText = minutesText;
	}

    public void replaceParticipants(List<String> participantIds) {
		participants.clear();
		for (String userId : participantIds) {
			participants.add(new MeetingParticipantEntity(this, userId));
		}
	}

	public void replaceActionItems(List<MeetingActionItemEntity> newItems) {
		actionItems.clear();
		actionItems.addAll(newItems);
	}

}
