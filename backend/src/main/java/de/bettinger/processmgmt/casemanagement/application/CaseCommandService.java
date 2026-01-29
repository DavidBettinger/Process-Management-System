package de.bettinger.processmgmt.casemanagement.application;

import de.bettinger.processmgmt.casemanagement.domain.ProcessCaseStatus;
import de.bettinger.processmgmt.casemanagement.domain.StakeholderRole;
import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.KitaRepository;
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
	private final KitaRepository kitaRepository;

	public CaseCommandService(ProcessCaseRepository processCaseRepository, KitaRepository kitaRepository) {
		this.processCaseRepository = processCaseRepository;
		this.kitaRepository = kitaRepository;
	}

	@Transactional
	public ProcessCaseEntity createCase(String tenantId, String title, UUID kitaId) {
		boolean kitaExists = kitaRepository.findByIdAndTenantId(kitaId, tenantId).isPresent();
		if (!kitaExists) {
			throw new NotFoundException("Kita not found: " + kitaId);
		}
		ProcessCaseEntity entity = new ProcessCaseEntity(
				UUID.randomUUID(),
				tenantId,
				title,
				kitaId,
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
