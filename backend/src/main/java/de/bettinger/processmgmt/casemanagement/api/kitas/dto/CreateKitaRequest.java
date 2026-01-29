package de.bettinger.processmgmt.casemanagement.api.kitas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateKitaRequest(
		@NotBlank String name,
		@NotNull UUID locationId
) {
}
