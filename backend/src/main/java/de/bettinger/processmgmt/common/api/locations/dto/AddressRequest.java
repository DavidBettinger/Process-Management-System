package de.bettinger.processmgmt.common.api.locations.dto;

import jakarta.validation.constraints.NotBlank;

public record AddressRequest(
		@NotBlank String street,
		@NotBlank String houseNumber,
		@NotBlank String postalCode,
		@NotBlank String city,
		String country
) {
}
