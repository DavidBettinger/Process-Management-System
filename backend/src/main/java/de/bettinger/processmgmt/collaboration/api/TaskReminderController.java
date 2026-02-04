package de.bettinger.processmgmt.collaboration.api;

import de.bettinger.processmgmt.auth.DevAuthFilter;
import de.bettinger.processmgmt.collaboration.api.TaskReminderDtos.CreateReminderRequest;
import de.bettinger.processmgmt.collaboration.api.TaskReminderDtos.CreateReminderResponse;
import de.bettinger.processmgmt.collaboration.api.TaskReminderDtos.TaskReminderResponse;
import de.bettinger.processmgmt.collaboration.api.TaskReminderDtos.TaskRemindersResponse;
import de.bettinger.processmgmt.collaboration.application.TaskReminderService;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskReminderEntity;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks/{taskId}/reminders")
public class TaskReminderController {

	private final TaskReminderService taskReminderService;

	public TaskReminderController(TaskReminderService taskReminderService) {
		this.taskReminderService = taskReminderService;
	}

	@PostMapping
	public ResponseEntity<CreateReminderResponse> createReminder(
			@PathVariable UUID taskId,
			@RequestHeader(DevAuthFilter.TENANT_HEADER) String tenantId,
			@Valid @RequestBody CreateReminderRequest request
	) {
		TaskReminderEntity reminder = taskReminderService.createReminder(
				tenantId,
				taskId,
				request.stakeholderId(),
				request.remindAt(),
				request.note()
		);
		return ResponseEntity.status(HttpStatus.CREATED).body(new CreateReminderResponse(reminder.getId()));
	}

	@GetMapping
	public TaskRemindersResponse listReminders(
			@PathVariable UUID taskId,
			@RequestHeader(DevAuthFilter.TENANT_HEADER) String tenantId
	) {
		List<TaskReminderResponse> items = taskReminderService.listReminders(tenantId, taskId).stream()
				.map(this::toResponse)
				.toList();
		return new TaskRemindersResponse(items);
	}

	@DeleteMapping("/{reminderId}")
	public ResponseEntity<Void> deleteReminder(
			@PathVariable UUID taskId,
			@PathVariable UUID reminderId,
			@RequestHeader(DevAuthFilter.TENANT_HEADER) String tenantId
	) {
		taskReminderService.deleteReminder(tenantId, taskId, reminderId);
		return ResponseEntity.noContent().build();
	}

	private TaskReminderResponse toResponse(TaskReminderEntity reminder) {
		return new TaskReminderResponse(
				reminder.getId(),
				reminder.getTaskId(),
				reminder.getStakeholderId(),
				reminder.getRemindAt(),
				reminder.getNote(),
				reminder.getCreatedAt()
		);
	}
}
