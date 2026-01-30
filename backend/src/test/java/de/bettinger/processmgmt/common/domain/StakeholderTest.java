package de.bettinger.processmgmt.common.domain;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class StakeholderTest {

	@Test
	void rejectsBlankFirstName() {
		assertThatThrownBy(() -> new Stakeholder(
				new StakeholderId(UUID.randomUUID()),
				"tenant-1",
				"  ",
				"Becker",
				StakeholderRole.CONSULTANT,
				Instant.now()
		)).isInstanceOf(IllegalArgumentException.class)
				.hasMessageContaining("firstName");
	}

	@Test
	void rejectsBlankLastName() {
		assertThatThrownBy(() -> new Stakeholder(
				new StakeholderId(UUID.randomUUID()),
				"tenant-1",
				"Maria",
				" ",
				StakeholderRole.CONSULTANT,
				Instant.now()
		)).isInstanceOf(IllegalArgumentException.class)
				.hasMessageContaining("lastName");
	}

	@Test
	void rejectsLongNames() {
		String longName = "a".repeat(Stakeholder.MAX_NAME_LENGTH + 1);
		assertThatThrownBy(() -> new Stakeholder(
				new StakeholderId(UUID.randomUUID()),
				"tenant-1",
				longName,
				"Becker",
				StakeholderRole.CONSULTANT,
				Instant.now()
		)).isInstanceOf(IllegalArgumentException.class)
				.hasMessageContaining("firstName");

		assertThatThrownBy(() -> new Stakeholder(
				new StakeholderId(UUID.randomUUID()),
				"tenant-1",
				"Maria",
				longName,
				StakeholderRole.CONSULTANT,
				Instant.now()
		)).isInstanceOf(IllegalArgumentException.class)
				.hasMessageContaining("lastName");
	}
}
