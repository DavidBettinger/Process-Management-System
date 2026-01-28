package de.bettinger.processmgmt.casemanagement.application;

import de.bettinger.processmgmt.casemanagement.domain.ProcessCaseStatus;
import de.bettinger.processmgmt.casemanagement.domain.StakeholderRole;
import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.ProcessCaseEntity;
import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.ProcessCaseRepository;
import de.bettinger.processmgmt.common.errors.NotFoundException;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CaseCommandService {

	private final ProcessCaseRepository processCaseRepository;

	public CaseCommandService(ProcessCaseRepository processCaseRepository) {
		this.processCaseRepository = processCaseRepository;
	}

	@Transactional
	public ProcessCaseEntity createCase(String tenantId, String title, String kitaName) {
		ProcessCaseEntity entity = new ProcessCaseEntity(
				UUID.randomUUID(),
				tenantId,
				title,
				kitaName,
				ProcessCaseStatus.DRAFT,
				Instant.now()
		);
		return processCaseRepository.save(entity);
	}

	@Transactional
	public ProcessCaseEntity addStakeholder(UUID caseId, String userId, StakeholderRole role) {
		ProcessCaseEntity entity = processCaseRepository.findById(caseId)
				.orElseThrow(() -> new NotFoundException("Case not found: " + caseId));
		entity.addStakeholder(userId, role);
		return processCaseRepository.save(entity);
	}

	@Transactional
	public ProcessCaseEntity activateCase(UUID caseId) {
		ProcessCaseEntity entity = processCaseRepository.findById(caseId)
				.orElseThrow(() -> new NotFoundException("Case not found: " + caseId));
		boolean hasConsultant = entity.getStakeholders().stream()
				.anyMatch(stakeholder -> stakeholder.getRole() == StakeholderRole.CONSULTANT);
		if (!hasConsultant) {
			throw new IllegalStateException("Cannot activate case without a consultant");
		}
		entity.setStatus(ProcessCaseStatus.ACTIVE);
		return processCaseRepository.save(entity);
	}
}
