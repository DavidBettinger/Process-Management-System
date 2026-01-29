package de.bettinger.processmgmt.common.api.locations.dto;

import java.util.UUID;

public record LocationResponse(
		UUID id,
		String label,
		AddressResponse address
) {
}
