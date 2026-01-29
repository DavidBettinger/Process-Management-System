package de.bettinger.processmgmt.common.api.locations.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateLocationRequest(
		@NotBlank String label,
		@NotNull @Valid AddressRequest address
) {
}
