package de.bettinger.processmgmt.analytics.api;

import de.bettinger.processmgmt.collaboration.domain.task.TaskState;
import de.bettinger.processmgmt.common.domain.StakeholderRole;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class TimelineGraphDtos {

	private TimelineGraphDtos() {
	}

	public enum TimelineGraphMeetingStatus {
		PLANNED,
		PERFORMED
	}

	public record TimelineGraphMeeting(
			UUID id,
			TimelineGraphMeetingStatus status,
			Instant plannedAt,
			Instant performedAt,
			String title,
			String locationLabel,
			List<String> participantStakeholderIds
	) {
	}

	public record TimelineGraphStakeholder(
			UUID id,
			String firstName,
			String lastName,
			StakeholderRole role
	) {
	}

	public record TimelineGraphTask(
			UUID id,
			String title,
			TaskState state,
			int priority,
			String assigneeId,
			UUID createdFromMeetingId,
			LocalDate dueDate
	) {
	}

	public record TimelineGraphResponse(
			UUID caseId,
			Instant generatedAt,
			Instant now,
			List<TimelineGraphMeeting> meetings,
			List<TimelineGraphStakeholder> stakeholders,
			List<TimelineGraphTask> tasks
	) {
	}
}
