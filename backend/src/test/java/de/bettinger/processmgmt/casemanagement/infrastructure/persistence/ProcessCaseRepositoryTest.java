package de.bettinger.processmgmt.casemanagement.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import de.bettinger.processmgmt.casemanagement.domain.ProcessCaseStatus;
import de.bettinger.processmgmt.casemanagement.domain.StakeholderRole;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
@Transactional
class ProcessCaseRepositoryTest {

	@Autowired
	private ProcessCaseRepository processCaseRepository;

	@Test
	void savesCaseWithStakeholder() {
		ProcessCaseEntity entity = new ProcessCaseEntity(
				UUID.randomUUID(),
				"tenant-1",
				"Title",
				UUID.randomUUID(),
				ProcessCaseStatus.DRAFT,
				Instant.now()
		);
		entity.addStakeholder("u-1", StakeholderRole.CONSULTANT);

		processCaseRepository.saveAndFlush(entity);

		ProcessCaseEntity saved = processCaseRepository.findById(entity.getId()).orElseThrow();
		assertThat(saved.getStakeholders()).hasSize(1);
		CaseStakeholderEntity stakeholder = saved.getStakeholders().getFirst();
		assertThat(stakeholder.getId().getUserId()).isEqualTo("u-1");
		assertThat(stakeholder.getRole()).isEqualTo(StakeholderRole.CONSULTANT);
	}
}
