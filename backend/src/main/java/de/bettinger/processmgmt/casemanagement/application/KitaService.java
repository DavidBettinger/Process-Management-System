package de.bettinger.processmgmt.casemanagement.application;

import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.KitaEntity;
import de.bettinger.processmgmt.casemanagement.infrastructure.persistence.KitaRepository;
import de.bettinger.processmgmt.common.errors.NotFoundException;
import de.bettinger.processmgmt.common.infrastructure.persistence.LocationRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class KitaService {

	private final KitaRepository kitaRepository;
	private final LocationRepository locationRepository;

	public KitaService(KitaRepository kitaRepository, LocationRepository locationRepository) {
		this.kitaRepository = kitaRepository;
		this.locationRepository = locationRepository;
	}

	@Transactional
	public KitaEntity createKita(String tenantId, String name, UUID locationId) {
		boolean locationExists = locationRepository.findByIdAndTenantId(locationId, tenantId).isPresent();
		if (!locationExists) {
			throw new NotFoundException("Location not found: " + locationId);
		}
		KitaEntity entity = new KitaEntity(UUID.randomUUID(), tenantId, name, locationId);
		return kitaRepository.save(entity);
	}

	@Transactional(readOnly = true)
	public List<KitaEntity> listKitas(String tenantId) {
		return kitaRepository.findAllByTenantId(tenantId);
	}

	@Transactional(readOnly = true)
	public KitaEntity getKita(String tenantId, UUID kitaId) {
		return kitaRepository.findByIdAndTenantId(kitaId, tenantId)
				.orElseThrow(() -> new NotFoundException("Kita not found: " + kitaId));
	}
}
