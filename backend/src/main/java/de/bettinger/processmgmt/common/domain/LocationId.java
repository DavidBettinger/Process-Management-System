package de.bettinger.processmgmt.common.domain;

import java.util.Objects;
import java.util.UUID;

public record LocationId(UUID value) {
	public LocationId {
		Objects.requireNonNull(value, "value");
	}
}
