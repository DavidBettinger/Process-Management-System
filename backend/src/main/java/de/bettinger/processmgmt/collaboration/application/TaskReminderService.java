package de.bettinger.processmgmt.collaboration.application;

import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.ProcessCaseRepository;
import de.bettinger.processmgmt.collaboration.domain.task.TaskReminder;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskEntity;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskReminderEntity;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskReminderRepository;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskRepository;
import de.bettinger.processmgmt.common.errors.NotFoundException;
import de.bettinger.processmgmt.common.infrastructure.persistence.StakeholderRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskReminderService {

	private final TaskRepository taskRepository;
	private final TaskReminderRepository taskReminderRepository;
	private final ProcessCaseRepository processCaseRepository;
	private final StakeholderRepository stakeholderRepository;

	public TaskReminderService(TaskRepository taskRepository,
							   TaskReminderRepository taskReminderRepository,
							   ProcessCaseRepository processCaseRepository,
							   StakeholderRepository stakeholderRepository) {
		this.taskRepository = taskRepository;
		this.taskReminderRepository = taskReminderRepository;
		this.processCaseRepository = processCaseRepository;
		this.stakeholderRepository = stakeholderRepository;
	}

	@Transactional
	public TaskReminderEntity createReminder(String tenantId, UUID taskId, UUID stakeholderId, Instant remindAt,
									 String note) {
		TaskEntity task = loadTaskForTenant(tenantId, taskId);
		ensureStakeholderExists(tenantId, stakeholderId);
		TaskReminder reminder = TaskReminder.create(task.getId(), stakeholderId, remindAt, note);
		TaskReminderEntity entity = new TaskReminderEntity(
				reminder.getId(),
				reminder.getTaskId(),
				reminder.getStakeholderId(),
				reminder.getRemindAt(),
				reminder.getNote(),
				reminder.getCreatedAt()
		);
		return taskReminderRepository.save(entity);
	}

	@Transactional(readOnly = true)
	public List<TaskReminderEntity> listReminders(String tenantId, UUID taskId) {
		loadTaskForTenant(tenantId, taskId);
		return taskReminderRepository.findAllByTaskIdOrderByRemindAtAsc(taskId);
	}

	@Transactional
	public void deleteReminder(String tenantId, UUID taskId, UUID reminderId) {
		loadTaskForTenant(tenantId, taskId);
		TaskReminderEntity reminder = taskReminderRepository.findByIdAndTaskId(reminderId, taskId)
				.orElseThrow(() -> new NotFoundException("Reminder not found: " + reminderId));
		taskReminderRepository.delete(reminder);
	}

	private TaskEntity loadTaskForTenant(String tenantId, UUID taskId) {
		TaskEntity task = taskRepository.findById(taskId)
				.orElseThrow(() -> new NotFoundException("Task not found: " + taskId));
		boolean caseExists = processCaseRepository.findByIdAndTenantId(task.getCaseId(), tenantId).isPresent();
		if (!caseExists) {
			throw new NotFoundException("Task not found: " + taskId);
		}
		return task;
	}

	private void ensureStakeholderExists(String tenantId, UUID stakeholderId) {
		stakeholderRepository.findByIdAndTenantId(stakeholderId, tenantId)
				.orElseThrow(() -> new NotFoundException("Stakeholder not found: " + stakeholderId));
	}
}
