package de.bettinger.processmgmt.common.domain;

import java.util.Objects;
import java.util.UUID;

public record StakeholderId(UUID value) {
	public StakeholderId {
		Objects.requireNonNull(value, "value");
	}
}
