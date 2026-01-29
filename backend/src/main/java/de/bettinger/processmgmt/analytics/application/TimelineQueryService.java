package de.bettinger.processmgmt.analytics.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.bettinger.processmgmt.analytics.api.TimelineDtos.TimelineEntry;
import de.bettinger.processmgmt.analytics.api.TimelineDtos.TimelineResponse;
import de.bettinger.processmgmt.common.outbox.OutboxEventEntity;
import de.bettinger.processmgmt.common.outbox.OutboxEventRepository;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class TimelineQueryService {

	private final OutboxEventRepository outboxEventRepository;
	private final ObjectMapper objectMapper;

	public TimelineQueryService(OutboxEventRepository outboxEventRepository, ObjectMapper objectMapper) {
		this.outboxEventRepository = outboxEventRepository;
		this.objectMapper = objectMapper;
	}

	public TimelineResponse getTimeline(UUID caseId) {
		String caseIdNeedle = "\"caseId\":\"" + caseId + "\"";
		List<TimelineEntry> entries = outboxEventRepository.findAllByPayloadContainingOrderByOccurredAtAsc(caseIdNeedle)
				.stream()
				.map(this::toEntry)
				.flatMap(java.util.Optional::stream)
				.toList();
		return new TimelineResponse(caseId, entries);
	}

	private java.util.Optional<TimelineEntry> toEntry(OutboxEventEntity event) {
		String type = toTimelineType(event.getEventType());
		if (type == null) {
			return java.util.Optional.empty();
		}
		JsonNode payload = parsePayload(event.getPayload());
		UUID meetingId = readUuid(payload, "meetingId");
		UUID taskId = readUuid(payload, "taskId");
		String assigneeId = readText(payload, "assigneeId");
		UUID locationId = readUuid(payload, "locationId");
		return java.util.Optional.of(new TimelineEntry(type, event.getOccurredAt(), meetingId, taskId, assigneeId,
				locationId));
	}

	private String toTimelineType(String eventType) {
		return switch (eventType) {
			case "TaskCreated" -> "TASK_CREATED";
			case "TaskAssigned" -> "TASK_ASSIGNED";
			case "TaskResolved" -> "TASK_RESOLVED";
			case "MeetingHeld" -> "MEETING_HELD";
			default -> null;
		};
	}

	private JsonNode parsePayload(String payload) {
		try {
			return objectMapper.readTree(payload);
		} catch (IOException ex) {
			return objectMapper.createObjectNode();
		}
	}

	private UUID readUuid(JsonNode node, String field) {
		String value = readText(node, field);
		if (value == null || value.isBlank()) {
			return null;
		}
		try {
			return UUID.fromString(value);
		} catch (IllegalArgumentException ex) {
			return null;
		}
	}

	private String readText(JsonNode node, String field) {
		JsonNode value = node.get(field);
		if (value == null || value.isNull()) {
			return null;
		}
		String text = value.asText();
		return text == null || text.isBlank() ? null : text;
	}
}
