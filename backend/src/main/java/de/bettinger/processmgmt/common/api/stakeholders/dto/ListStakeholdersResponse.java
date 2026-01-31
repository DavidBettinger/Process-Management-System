package de.bettinger.processmgmt.common.api.stakeholders.dto;

import java.util.List;

public record ListStakeholdersResponse(
		List<StakeholderSummaryResponse> items,
		int page,
		int size,
		long totalItems,
		int totalPages
) {
	public static ListStakeholdersResponse from(
			de.bettinger.processmgmt.common.api.paging.PageResponse<StakeholderSummaryResponse> pageResponse) {
		return new ListStakeholdersResponse(
				pageResponse.items(),
				pageResponse.page(),
				pageResponse.size(),
				pageResponse.totalItems(),
				pageResponse.totalPages()
		);
	}
}
