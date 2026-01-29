package de.bettinger.processmgmt.casemanagement.domain;

import java.util.Objects;
import java.util.UUID;

public record KitaId(UUID value) {
	public KitaId {
		Objects.requireNonNull(value, "value");
	}
}
