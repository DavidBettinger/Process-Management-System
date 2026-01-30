package de.bettinger.processmgmt.common.api.stakeholders.dto;

import de.bettinger.processmgmt.common.domain.StakeholderRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateStakeholderRequest(
		@NotBlank
		@Size(max = 100)
		String firstName,
		@NotBlank
		@Size(max = 100)
		String lastName,
		@NotNull
		StakeholderRole role
) {
}
