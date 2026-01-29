package de.bettinger.processmgmt.common.api.locations.dto;

public record AddressResponse(
		String street,
		String houseNumber,
		String postalCode,
		String city,
		String country
) {
}
