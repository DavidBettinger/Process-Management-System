package de.bettinger.processmgmt.collaboration.domain.task;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.UUID;
import org.junit.jupiter.api.Test;

class TaskTest {

	@Test
	void supportsAllowedTransitions() {
		Task task = Task.create(UUID.randomUUID(), "Title", "Desc", 3);

		assertThat(task.getState()).isEqualTo(TaskState.OPEN);

		task.assign("u-1");
		assertThat(task.getState()).isEqualTo(TaskState.ASSIGNED);
		assertThat(task.getAssigneeId()).isEqualTo("u-1");

		task.start();
		assertThat(task.getState()).isEqualTo(TaskState.IN_PROGRESS);

		task.block("Waiting");
		assertThat(task.getState()).isEqualTo(TaskState.BLOCKED);

		task.unblock();
		assertThat(task.getState()).isEqualTo(TaskState.IN_PROGRESS);
	}

	@Test
	void resolvingSetsResolutionAndBecomesTerminal() {
		Task task = Task.create(UUID.randomUUID(), "Title", "Desc", 3);
		task.assign("u-1");

		task.resolve(TaskResolutionKind.NOT_COMPLETED, "Reason", "u-1");

		assertThat(task.getState()).isEqualTo(TaskState.RESOLVED);
		assertThat(task.getResolutionKind()).isEqualTo(TaskResolutionKind.NOT_COMPLETED);
		assertThat(task.getResolutionReason()).isEqualTo("Reason");
		assertThat(task.getResolvedBy()).isEqualTo("u-1");
		assertThat(task.getResolvedAt()).isNotNull();

		assertThatThrownBy(task::start)
				.isInstanceOf(IllegalStateException.class);
	}

	@Test
	void decliningAssignmentClearsAssigneeAndReturnsToOpen() {
		Task task = Task.create(UUID.randomUUID(), "Title", "Desc", 3);
		task.assign("u-1");

		task.declineAssignment("Not responsible", "u-2");

		assertThat(task.getState()).isEqualTo(TaskState.OPEN);
		assertThat(task.getAssigneeId()).isNull();
		assertThat(task.getLastDeclineReason()).isEqualTo("Not responsible");
		assertThat(task.getLastSuggestedAssigneeId()).isEqualTo("u-2");
	}

	@Test
	void rejectsPriorityOutsideRange() {
		assertThatThrownBy(() -> Task.create(UUID.randomUUID(), "Title", "Desc", 0))
				.isInstanceOf(IllegalArgumentException.class);

		assertThatThrownBy(() -> Task.create(UUID.randomUUID(), "Title", "Desc", 6))
				.isInstanceOf(IllegalArgumentException.class);
	}
}
