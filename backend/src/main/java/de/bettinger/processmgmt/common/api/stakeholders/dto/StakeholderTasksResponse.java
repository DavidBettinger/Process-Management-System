package de.bettinger.processmgmt.common.api.stakeholders.dto;

import java.util.List;
import java.util.UUID;

public record StakeholderTasksResponse(
		UUID stakeholderId,
		List<StakeholderTaskSummaryResponse> items,
		int page,
		int size,
		long totalItems,
		int totalPages
) {
	public static StakeholderTasksResponse from(
			UUID stakeholderId,
			de.bettinger.processmgmt.common.api.paging.PageResponse<StakeholderTaskSummaryResponse> pageResponse
	) {
		return new StakeholderTasksResponse(
				stakeholderId,
				pageResponse.items(),
				pageResponse.page(),
				pageResponse.size(),
				pageResponse.totalItems(),
				pageResponse.totalPages()
		);
	}
}
