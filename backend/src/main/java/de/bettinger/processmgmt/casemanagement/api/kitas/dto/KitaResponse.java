package de.bettinger.processmgmt.casemanagement.api.kitas.dto;

import java.util.UUID;

public record KitaResponse(
		UUID id,
		String name,
		UUID locationId
) {
}
