package de.bettinger.processmgmt.common.api.stakeholders.dto;

import de.bettinger.processmgmt.common.domain.StakeholderRole;
import java.time.Instant;
import java.util.UUID;

public record StakeholderDto(
		UUID id,
		String tenantId,
		String firstName,
		String lastName,
		StakeholderRole role,
		Instant createdAt
) {
}
