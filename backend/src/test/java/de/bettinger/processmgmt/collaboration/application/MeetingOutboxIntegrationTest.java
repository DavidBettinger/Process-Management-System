package de.bettinger.processmgmt.collaboration.application;

import static org.assertj.core.api.Assertions.assertThat;

import de.bettinger.processmgmt.common.outbox.OutboxEventEntity;
import de.bettinger.processmgmt.common.outbox.OutboxEventRepository;
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

	@Test
	void writesOutboxEventsForMeetingHoldAndActionItemTaskCreation() {
		outboxEventRepository.deleteAll();
		UUID caseId = UUID.randomUUID();
		UUID meetingId = meetingCommandService.scheduleMeeting(caseId, Instant.now(), List.of("u-1")).getId();

		List<MeetingActionItemCommand> actionItems = List.of(
				new MeetingActionItemCommand("AI-1", "Follow up", "u-2", null)
		);
		meetingCommandService.holdMeeting(meetingId, Instant.now(), "Minutes", List.of("u-1"), actionItems);

		List<String> eventTypes = outboxEventRepository.findAll().stream()
				.map(OutboxEventEntity::getEventType)
				.toList();

		assertThat(eventTypes).contains("MeetingHeld", "TaskCreated");
	}
}
