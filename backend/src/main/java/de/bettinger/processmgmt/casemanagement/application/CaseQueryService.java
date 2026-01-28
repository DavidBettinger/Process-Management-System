package de.bettinger.processmgmt.casemanagement.application;

import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.ProcessCaseEntity;
import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.ProcessCaseRepository;
import de.bettinger.processmgmt.common.errors.NotFoundException;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class CaseQueryService {

	private final ProcessCaseRepository processCaseRepository;

	public CaseQueryService(ProcessCaseRepository processCaseRepository) {
		this.processCaseRepository = processCaseRepository;
	}

	public ProcessCaseEntity getCase(UUID caseId) {
		return processCaseRepository.findById(caseId)
				.orElseThrow(() -> new NotFoundException("Case not found: " + caseId));
	}

	public List<ProcessCaseEntity> listCases(String tenantId) {
		return processCaseRepository.findAllByTenantIdOrderByCreatedAtDesc(tenantId);
	}
}
