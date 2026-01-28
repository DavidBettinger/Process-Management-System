package de.bettinger.processmgmt.collaboration.application;

import static org.assertj.core.api.Assertions.assertThat;

import de.bettinger.processmgmt.collaboration.infrastructure.persistence.MeetingEntity;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class MeetingActionItemTaskCreationTest {

	@Autowired
	private MeetingCommandService meetingCommandService;

	@Autowired
	private TaskRepository taskRepository;

	@Test
	void holdMeetingCreatesTasksOncePerActionItemKey() {
		taskRepository.deleteAll();
		UUID caseId = UUID.randomUUID();
		MeetingEntity meeting = meetingCommandService.scheduleMeeting(caseId, Instant.now(), List.of("u-1"));

		MeetingActionItemCommand actionItem = new MeetingActionItemCommand(
				"ai-1",
				"Draft concept",
				"u-1",
				LocalDate.now()
		);

		meetingCommandService.holdMeeting(meeting.getId(), Instant.now(), "Minutes",
				List.of("u-1"), List.of(actionItem));

		assertThat(taskRepository.count()).isEqualTo(1);
		MeetingEntity updated = meetingCommandService.holdMeeting(meeting.getId(), Instant.now(), "Minutes",
				List.of("u-1"), List.of(actionItem));
		assertThat(updated.getActionItems())
				.hasSize(1)
				.allMatch(item -> item.getCreatedTaskId() != null);

		meetingCommandService.holdMeeting(meeting.getId(), Instant.now(), "Minutes update",
				List.of("u-1"), List.of(actionItem));

		assertThat(taskRepository.count()).isEqualTo(1);
	}
}
