package de.bettinger.processmgmt.common.api.stakeholders.dto;

import de.bettinger.processmgmt.common.domain.StakeholderRole;
import java.util.UUID;

public record StakeholderSummaryResponse(
		UUID id,
		String firstName,
		String lastName,
		StakeholderRole role
) {
}
