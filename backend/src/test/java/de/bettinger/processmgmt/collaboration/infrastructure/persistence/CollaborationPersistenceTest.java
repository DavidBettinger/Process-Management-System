package de.bettinger.processmgmt.collaboration.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import de.bettinger.processmgmt.collaboration.domain.meeting.MeetingStatus;
import de.bettinger.processmgmt.collaboration.domain.task.TaskResolutionKind;
import de.bettinger.processmgmt.collaboration.domain.task.TaskState;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class CollaborationPersistenceTest {

	@Autowired
	private MeetingRepository meetingRepository;

	@Autowired
	private TaskRepository taskRepository;

	@Test
	void savesMeeting() {
		MeetingEntity meeting = new MeetingEntity(
				UUID.randomUUID(),
				UUID.randomUUID(),
				MeetingStatus.SCHEDULED,
				Instant.now(),
				null,
				null
		);

		meetingRepository.saveAndFlush(meeting);

		MeetingEntity saved = meetingRepository.findById(meeting.getId()).orElseThrow();
		assertThat(saved.getStatus()).isEqualTo(MeetingStatus.SCHEDULED);
	}

	@Test
	void savesTask() {
		TaskEntity task = new TaskEntity(
				UUID.randomUUID(),
				UUID.randomUUID(),
				null,
				"Title",
				"Description",
				LocalDate.now(),
				"u-1",
				TaskState.ASSIGNED,
				TaskResolutionKind.COMPLETED,
				"Done",
				"u-1",
				Instant.now(),
				"Declined",
				"u-2",
				Instant.now()
		);

		taskRepository.saveAndFlush(task);

		TaskEntity saved = taskRepository.findById(task.getId()).orElseThrow();
		assertThat(saved.getResolutionKind()).isEqualTo(TaskResolutionKind.COMPLETED);
		assertThat(saved.getAssigneeId()).isEqualTo("u-1");
		assertThat(saved.getLastDeclineReason()).isEqualTo("Declined");
		assertThat(saved.getLastSuggestedAssigneeId()).isEqualTo("u-2");
	}
}
