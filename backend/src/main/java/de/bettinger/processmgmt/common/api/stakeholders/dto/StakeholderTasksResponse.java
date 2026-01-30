package de.bettinger.processmgmt.common.api.stakeholders.dto;

import java.util.List;
import java.util.UUID;

public record StakeholderTasksResponse(
		UUID stakeholderId,
		List<StakeholderTaskSummaryResponse> items
) {
}
