package de.bettinger.processmgmt.common.api.stakeholders.dto;

import de.bettinger.processmgmt.collaboration.domain.task.TaskState;
import java.time.LocalDate;
import java.util.UUID;

public record StakeholderTaskSummaryResponse(
		UUID id,
		UUID caseId,
		String title,
		TaskState state,
		String assigneeId,
		LocalDate dueDate
) {
}
