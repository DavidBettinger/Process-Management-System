package de.bettinger.processmgmt.collaboration.application;

import static org.assertj.core.api.Assertions.assertThat;

import de.bettinger.processmgmt.collaboration.domain.task.TaskResolutionKind;
import de.bettinger.processmgmt.common.outbox.OutboxEventEntity;
import de.bettinger.processmgmt.common.outbox.OutboxEventRepository;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
class TaskOutboxIntegrationTest {

	@Autowired
	private TaskCommandService taskCommandService;

	@Autowired
	private OutboxEventRepository outboxEventRepository;

	@Test
	void writesOutboxEventsForTaskLifecycle() {
		UUID caseId = UUID.randomUUID();
		UUID taskId = taskCommandService.createTask(caseId, "Title", "Desc").getId();

		taskCommandService.assignTask(taskId, "u-1");
		taskCommandService.resolveTask(taskId, TaskResolutionKind.COMPLETED, "Done", "u-1");

		List<String> eventTypes = outboxEventRepository.findAll().stream()
				.map(OutboxEventEntity::getEventType)
				.toList();

		assertThat(eventTypes).contains("TaskCreated", "TaskAssigned", "TaskResolved");
		assertThat(outboxEventRepository.count()).isEqualTo(3);
	}
}
