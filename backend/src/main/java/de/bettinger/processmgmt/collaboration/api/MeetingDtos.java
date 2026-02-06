package de.bettinger.processmgmt.collaboration.api;

import de.bettinger.processmgmt.collaboration.domain.meeting.MeetingStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class MeetingDtos {

	private MeetingDtos() {
	}

	public record ScheduleMeetingRequest(
			@NotNull Instant scheduledAt,
			@NotNull UUID locationId,
			@NotEmpty List<String> participantIds,
			@NotBlank @Size(max = 200) String title,
			@Size(max = 10_000) String description
	) {
	}

	public record ScheduleMeetingResponse(UUID id, MeetingStatus status, UUID locationId, List<String> participantIds,
										  String title, String description) {
	}

	public record UpdateMeetingRequest(
			@NotNull Instant scheduledAt,
			@NotNull UUID locationId,
			@NotEmpty List<String> participantIds,
			@NotBlank @Size(max = 200) String title,
			@Size(max = 10_000) String description
	) {
	}

	public record UpdateMeetingResponse(UUID id, MeetingStatus status, UUID locationId, List<String> participantIds,
										String title, String description, Instant scheduledAt) {
	}

	public record HoldMeetingRequest(
			@NotNull Instant heldAt,
			@NotNull UUID locationId,
			@NotEmpty List<String> participantIds,
			@NotBlank String minutesText,
			List<@Valid ActionItemRequest> actionItems
	) {
	}

	public record ActionItemRequest(
			@NotBlank String key,
			@NotBlank String title,
			String assigneeId,
			LocalDate dueDate,
			@Min(1) @Max(5) Integer priority,
			@Size(max = 10_000) String description
	) {
	}

	public record HoldMeetingResponse(UUID meetingId, List<UUID> createdTaskIds) {
	}

	public record MeetingSummaryResponse(UUID id, MeetingStatus status, UUID locationId, List<String> participantIds,
										 String title, String description, Instant scheduledAt, Instant heldAt) {
	}

	public record MeetingsResponse(List<MeetingSummaryResponse> items) {
	}
}
