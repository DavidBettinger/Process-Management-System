package de.bettinger.processmgmt.casemanagement.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.UUID;
import org.junit.jupiter.api.Test;

class ProcessCaseTest {

	@Test
	void activationRequiresAtLeastOneConsultant() {
		ProcessCase processCase = ProcessCase.create("tenant-1", "Title", UUID.randomUUID());
		processCase.addStakeholder("u-1", StakeholderRole.DIRECTOR);

		assertThatThrownBy(processCase::activate)
				.isInstanceOf(IllegalStateException.class)
				.hasMessageContaining("consultant");

		processCase.addStakeholder("u-2", StakeholderRole.CONSULTANT);
		processCase.activate();

		assertThat(processCase.getStatus()).isEqualTo(ProcessCaseStatus.ACTIVE);
	}

	@Test
	void addingStakeholdersStoresRole() {
		ProcessCase processCase = ProcessCase.create("tenant-1", "Title", UUID.randomUUID());
		processCase.addStakeholder("u-1", StakeholderRole.CONSULTANT);

		assertThat(processCase.getStakeholders())
				.containsExactly(new Stakeholder("u-1", StakeholderRole.CONSULTANT));
	}
}
