package de.bettinger.processmgmt.collaboration.api;

import de.bettinger.processmgmt.collaboration.domain.task.TaskResolutionKind;
import de.bettinger.processmgmt.collaboration.domain.task.TaskState;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class TaskDtos {

	private TaskDtos() {
	}

	public record CreateTaskRequest(
			@NotBlank String title,
			@Size(max = 10_000) String description,
			@NotNull @Min(1) @Max(5) Integer priority,
			LocalDate dueDate
	) {
	}

	public record CreateTaskResponse(UUID id, TaskState state) {
	}

	public record AssignTaskRequest(@NotBlank String assigneeId) {
	}

	public record TaskStatusResponse(UUID id, TaskState state, String assigneeId) {
	}

	public record BlockTaskRequest(@NotBlank String reason) {
	}

	public record DeclineTaskRequest(@NotBlank String reason, String suggestedAssigneeId) {
	}

	public record ResolveTaskRequest(@NotNull TaskResolutionKind kind, @NotBlank String reason, List<String> evidenceRefs) {
	}

	public record TaskSummaryResponse(UUID id, String title, String description, int priority, TaskState state,
									  String assigneeId) {
	}

	public record TasksResponse(List<TaskSummaryResponse> items) {
	}
}
