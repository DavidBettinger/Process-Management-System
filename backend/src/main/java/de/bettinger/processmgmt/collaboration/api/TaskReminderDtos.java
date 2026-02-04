package de.bettinger.processmgmt.collaboration.api;

import de.bettinger.processmgmt.collaboration.domain.task.TaskReminder;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class TaskReminderDtos {

	private TaskReminderDtos() {
	}

	public record CreateReminderRequest(
			@NotNull UUID stakeholderId,
			@NotNull @Future Instant remindAt,
			@Size(max = TaskReminder.MAX_NOTE_LENGTH) String note
	) {
	}

	public record CreateReminderResponse(UUID id) {
	}

	public record TaskReminderResponse(
			UUID id,
			UUID taskId,
			UUID stakeholderId,
			Instant remindAt,
			String note,
			Instant createdAt
	) {
	}

	public record TaskRemindersResponse(List<TaskReminderResponse> items) {
	}
}
