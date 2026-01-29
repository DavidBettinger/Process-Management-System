package de.bettinger.processmgmt.common.application;

import de.bettinger.processmgmt.common.domain.Address;
import de.bettinger.processmgmt.common.errors.NotFoundException;
import de.bettinger.processmgmt.common.infrastructure.persistence.LocationEntity;
import de.bettinger.processmgmt.common.infrastructure.persistence.LocationRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LocationService {

	private final LocationRepository locationRepository;

	public LocationService(LocationRepository locationRepository) {
		this.locationRepository = locationRepository;
	}

	@Transactional
	public LocationEntity createLocation(String tenantId, String label, Address address) {
		LocationEntity entity = new LocationEntity(UUID.randomUUID(), tenantId, label, address);
		return locationRepository.save(entity);
	}

	@Transactional(readOnly = true)
	public List<LocationEntity> listLocations(String tenantId) {
		return locationRepository.findAllByTenantId(tenantId);
	}

	@Transactional(readOnly = true)
	public LocationEntity getLocation(String tenantId, UUID locationId) {
		return locationRepository.findByIdAndTenantId(locationId, tenantId)
				.orElseThrow(() -> new NotFoundException("Location not found: " + locationId));
	}
}
