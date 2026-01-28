package de.bettinger.processmgmt.collaboration.api;

import de.bettinger.processmgmt.collaboration.domain.meeting.MeetingStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class MeetingDtos {

	private MeetingDtos() {
	}

	public record ScheduleMeetingRequest(@NotNull Instant scheduledAt, @NotEmpty List<String> participantIds) {
	}

	public record ScheduleMeetingResponse(UUID id, MeetingStatus status) {
	}

	public record HoldMeetingRequest(
			@NotNull Instant heldAt,
			@NotEmpty List<String> participantIds,
			@NotBlank String minutesText,
			List<@Valid ActionItemRequest> actionItems
	) {
	}

	public record ActionItemRequest(@NotBlank String key, @NotBlank String title, String assigneeId, LocalDate dueDate) {
	}

	public record HoldMeetingResponse(UUID meetingId, List<UUID> createdTaskIds) {
	}
}
