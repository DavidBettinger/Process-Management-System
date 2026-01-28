package de.bettinger.processmgmt.collaboration.api;

import de.bettinger.processmgmt.collaboration.api.TaskDtos.AssignTaskRequest;
import de.bettinger.processmgmt.collaboration.api.TaskDtos.BlockTaskRequest;
import de.bettinger.processmgmt.collaboration.api.TaskDtos.CreateTaskRequest;
import de.bettinger.processmgmt.collaboration.api.TaskDtos.CreateTaskResponse;
import de.bettinger.processmgmt.collaboration.api.TaskDtos.DeclineTaskRequest;
import de.bettinger.processmgmt.collaboration.api.TaskDtos.ResolveTaskRequest;
import de.bettinger.processmgmt.collaboration.api.TaskDtos.TaskStatusResponse;
import de.bettinger.processmgmt.collaboration.application.TaskCommandService;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskEntity;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import de.bettinger.processmgmt.auth.DevAuthFilter;

@RestController
@RequestMapping("/api")
public class TaskController {

	private final TaskCommandService taskCommandService;

	public TaskController(TaskCommandService taskCommandService) {
		this.taskCommandService = taskCommandService;
	}

	@PostMapping("/cases/{caseId}/tasks")
	public ResponseEntity<CreateTaskResponse> createTask(
			@PathVariable UUID caseId,
			@Valid @RequestBody CreateTaskRequest request
	) {
		TaskEntity task = taskCommandService.createTask(caseId, request.title(), request.description(), request.dueDate());
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(new CreateTaskResponse(task.getId(), task.getState()));
	}

	@PostMapping("/tasks/{taskId}/assign")
	public TaskStatusResponse assignTask(
			@PathVariable UUID taskId,
			@Valid @RequestBody AssignTaskRequest request
	) {
		TaskEntity task = taskCommandService.assignTask(taskId, request.assigneeId());
		return new TaskStatusResponse(task.getId(), task.getState(), task.getAssigneeId());
	}

	@PostMapping("/tasks/{taskId}/start")
	public TaskStatusResponse startTask(@PathVariable UUID taskId) {
		TaskEntity task = taskCommandService.startTask(taskId);
		return new TaskStatusResponse(task.getId(), task.getState(), task.getAssigneeId());
	}

	@PostMapping("/tasks/{taskId}/block")
	public TaskStatusResponse blockTask(
			@PathVariable UUID taskId,
			@Valid @RequestBody BlockTaskRequest request
	) {
		TaskEntity task = taskCommandService.blockTask(taskId, request.reason());
		return new TaskStatusResponse(task.getId(), task.getState(), task.getAssigneeId());
	}

	@PostMapping("/tasks/{taskId}/unblock")
	public TaskStatusResponse unblockTask(@PathVariable UUID taskId) {
		TaskEntity task = taskCommandService.unblockTask(taskId);
		return new TaskStatusResponse(task.getId(), task.getState(), task.getAssigneeId());
	}

	@PostMapping("/tasks/{taskId}/decline")
	public TaskStatusResponse declineAssignment(
			@PathVariable UUID taskId,
			@Valid @RequestBody DeclineTaskRequest request
	) {
		TaskEntity task = taskCommandService.declineAssignment(taskId, request.reason(), request.suggestedAssigneeId());
		return new TaskStatusResponse(task.getId(), task.getState(), task.getAssigneeId());
	}

	@PostMapping("/tasks/{taskId}/resolve")
	public TaskStatusResponse resolveTask(
			@PathVariable UUID taskId,
			@Valid @RequestBody ResolveTaskRequest request,
			@RequestHeader(DevAuthFilter.USER_HEADER) String resolvedBy
	) {
		TaskEntity task = taskCommandService.resolveTask(taskId, request.kind(), request.reason(), resolvedBy);
		return new TaskStatusResponse(task.getId(), task.getState(), task.getAssigneeId());
	}
}
