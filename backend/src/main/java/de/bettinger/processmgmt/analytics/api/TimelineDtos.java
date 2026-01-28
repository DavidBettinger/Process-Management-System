package de.bettinger.processmgmt.analytics.api;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class TimelineDtos {

	private TimelineDtos() {
	}

	public record TimelineEntry(String type, Instant occurredAt, UUID meetingId, UUID taskId, String assigneeId) {
	}

	public record TimelineResponse(UUID caseId, List<TimelineEntry> entries) {
	}
}
