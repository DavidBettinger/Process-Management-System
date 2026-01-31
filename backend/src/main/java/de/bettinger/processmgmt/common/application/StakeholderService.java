package de.bettinger.processmgmt.common.application;

import de.bettinger.processmgmt.common.domain.Stakeholder;
import de.bettinger.processmgmt.common.domain.StakeholderId;
import de.bettinger.processmgmt.common.errors.NotFoundException;
import de.bettinger.processmgmt.common.infrastructure.persistence.StakeholderEntity;
import de.bettinger.processmgmt.common.infrastructure.persistence.StakeholderRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StakeholderService {

	private final StakeholderRepository stakeholderRepository;

	public StakeholderService(StakeholderRepository stakeholderRepository) {
		this.stakeholderRepository = stakeholderRepository;
	}

	@Transactional
	public StakeholderEntity createStakeholder(String tenantId, String firstName, String lastName,
											   de.bettinger.processmgmt.common.domain.StakeholderRole role) {
		Stakeholder stakeholder = new Stakeholder(
				new StakeholderId(UUID.randomUUID()),
				tenantId,
				firstName,
				lastName,
				role,
				Instant.now()
		);
		StakeholderEntity entity = new StakeholderEntity(
				stakeholder.id().value(),
				stakeholder.tenantId(),
				stakeholder.firstName(),
				stakeholder.lastName(),
				stakeholder.role(),
				stakeholder.createdAt()
		);
		return stakeholderRepository.save(entity);
	}

	@Transactional(readOnly = true)
	public List<StakeholderEntity> listStakeholders(String tenantId) {
		return stakeholderRepository.findByTenantId(tenantId);
	}

	@Transactional(readOnly = true)
	public Page<StakeholderEntity> listStakeholders(String tenantId, Pageable pageable) {
		return stakeholderRepository.findByTenantId(tenantId, pageable);
	}

	@Transactional(readOnly = true)
	public StakeholderEntity getStakeholder(String tenantId, UUID stakeholderId) {
		return stakeholderRepository.findByIdAndTenantId(stakeholderId, tenantId)
				.orElseThrow(() -> new NotFoundException("Stakeholder not found: " + stakeholderId));
	}
}
