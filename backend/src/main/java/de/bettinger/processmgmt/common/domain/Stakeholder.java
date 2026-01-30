package de.bettinger.processmgmt.common.domain;

import java.time.Instant;
import java.util.Objects;

public record Stakeholder(
		StakeholderId id,
		String tenantId,
		String firstName,
		String lastName,
		StakeholderRole role,
		Instant createdAt
) {
	public static final int MAX_NAME_LENGTH = 100;

	public Stakeholder {
		Objects.requireNonNull(id, "id");
		Objects.requireNonNull(tenantId, "tenantId");
		Objects.requireNonNull(firstName, "firstName");
		Objects.requireNonNull(lastName, "lastName");
		Objects.requireNonNull(role, "role");
		Objects.requireNonNull(createdAt, "createdAt");

		firstName = firstName.trim();
		lastName = lastName.trim();

		if (firstName.isBlank()) {
			throw new IllegalArgumentException("firstName must not be blank");
		}
		if (lastName.isBlank()) {
			throw new IllegalArgumentException("lastName must not be blank");
		}
		if (firstName.length() > MAX_NAME_LENGTH) {
			throw new IllegalArgumentException("firstName must be at most " + MAX_NAME_LENGTH + " characters");
		}
		if (lastName.length() > MAX_NAME_LENGTH) {
			throw new IllegalArgumentException("lastName must be at most " + MAX_NAME_LENGTH + " characters");
		}
	}
}
