package de.bettinger.processmgmt.collaboration.application;

import static org.assertj.core.api.Assertions.assertThat;

import de.bettinger.processmgmt.common.outbox.OutboxEventEntity;
import de.bettinger.processmgmt.common.outbox.OutboxEventRepository;
import de.bettinger.processmgmt.common.domain.Address;
import de.bettinger.processmgmt.common.infrastructure.persistence.LocationEntity;
import de.bettinger.processmgmt.common.infrastructure.persistence.LocationRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class MeetingOutboxIntegrationTest {

	@Autowired
	private MeetingCommandService meetingCommandService;

	@Autowired
	private OutboxEventRepository outboxEventRepository;

	@Autowired
	private LocationRepository locationRepository;

	@Test
	void writesOutboxEventsForMeetingHoldAndActionItemTaskCreation() {
		outboxEventRepository.deleteAll();
		String tenantId = "tenant-1";
		UUID caseId = UUID.randomUUID();
		UUID locationId = seedLocation(tenantId, "Kita Sonnenblume");
		UUID meetingId = meetingCommandService.scheduleMeeting(
				tenantId,
				caseId,
				locationId,
				"Kickoff",
				null,
				Instant.now(),
				List.of("u-1")
		).getId();

		List<MeetingActionItemCommand> actionItems = List.of(
				new MeetingActionItemCommand("AI-1", "Follow up", "u-2", null, 3, "Prepare follow-up notes")
		);
		meetingCommandService.holdMeeting(
				tenantId,
				meetingId,
				locationId,
				Instant.now(),
				"Minutes",
				List.of("u-1"),
				actionItems
		);

		List<String> eventTypes = outboxEventRepository.findAll().stream()
				.map(OutboxEventEntity::getEventType)
				.toList();

		assertThat(eventTypes).contains("MeetingHeld", "TaskCreated");
	}

	private UUID seedLocation(String tenantId, String label) {
		UUID locationId = UUID.randomUUID();
		LocationEntity entity = new LocationEntity(
				locationId,
				tenantId,
				label,
				new Address("Musterstrasse", "12", "10115", "Berlin", "DE")
		);
		locationRepository.saveAndFlush(entity);
		return locationId;
	}
}
