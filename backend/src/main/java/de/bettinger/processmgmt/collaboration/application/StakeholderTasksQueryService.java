package de.bettinger.processmgmt.collaboration.application;

import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.ProcessCaseEntity;
import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.ProcessCaseRepository;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskEntity;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.TaskRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StakeholderTasksQueryService {

	private final TaskRepository taskRepository;
	private final ProcessCaseRepository processCaseRepository;

	public StakeholderTasksQueryService(TaskRepository taskRepository, ProcessCaseRepository processCaseRepository) {
		this.taskRepository = taskRepository;
		this.processCaseRepository = processCaseRepository;
	}

	@Transactional(readOnly = true)
	public List<TaskEntity> listAssignedTasks(String tenantId, UUID stakeholderId) {
		List<UUID> caseIds = processCaseRepository.findAllByTenantIdOrderByCreatedAtDesc(tenantId).stream()
				.map(ProcessCaseEntity::getId)
				.toList();
		if (caseIds.isEmpty()) {
			return List.of();
		}
		return taskRepository.findAllByAssigneeIdAndCaseIdInOrderByCreatedAtDesc(stakeholderId.toString(), caseIds);
	}
}
