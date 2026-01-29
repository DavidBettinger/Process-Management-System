package de.bettinger.processmgmt.collaboration.application;

import static org.assertj.core.api.Assertions.assertThat;

import de.bettinger.processmgmt.collaboration.infrastructure.persistence.MeetingEntity;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskRepository;
import de.bettinger.processmgmt.common.domain.Address;
import de.bettinger.processmgmt.common.infrastructure.persistence.LocationEntity;
import de.bettinger.processmgmt.common.infrastructure.persistence.LocationRepository;
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

	@Autowired
	private LocationRepository locationRepository;

	@Test
	void holdMeetingCreatesTasksOncePerActionItemKey() {
		taskRepository.deleteAll();
		String tenantId = "tenant-1";
		UUID caseId = UUID.randomUUID();
		UUID locationId = seedLocation(tenantId, "Kita Sonnenblume");
		MeetingEntity meeting = meetingCommandService.scheduleMeeting(
				tenantId,
				caseId,
				locationId,
				Instant.now(),
				List.of("u-1")
		);

		MeetingActionItemCommand actionItem = new MeetingActionItemCommand(
				"ai-1",
				"Draft concept",
				"u-1",
				LocalDate.now()
		);

		meetingCommandService.holdMeeting(tenantId, meeting.getId(), locationId, Instant.now(), "Minutes",
				List.of("u-1"), List.of(actionItem));

		assertThat(taskRepository.count()).isEqualTo(1);
		MeetingEntity updated = meetingCommandService.holdMeeting(tenantId, meeting.getId(), locationId, Instant.now(),
				"Minutes", List.of("u-1"), List.of(actionItem));
		assertThat(updated.getActionItems())
				.hasSize(1)
				.allMatch(item -> item.getCreatedTaskId() != null);

		meetingCommandService.holdMeeting(tenantId, meeting.getId(), locationId, Instant.now(), "Minutes update",
				List.of("u-1"), List.of(actionItem));

		assertThat(taskRepository.count()).isEqualTo(1);
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
