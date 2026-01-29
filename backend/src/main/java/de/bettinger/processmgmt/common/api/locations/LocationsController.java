package de.bettinger.processmgmt.common.api.locations;

import de.bettinger.processmgmt.auth.DevAuthFilter;
import de.bettinger.processmgmt.common.api.locations.dto.AddressRequest;
import de.bettinger.processmgmt.common.api.locations.dto.AddressResponse;
import de.bettinger.processmgmt.common.api.locations.dto.CreateLocationRequest;
import de.bettinger.processmgmt.common.api.locations.dto.CreateLocationResponse;
import de.bettinger.processmgmt.common.api.locations.dto.LocationResponse;
import de.bettinger.processmgmt.common.api.locations.dto.LocationsResponse;
import de.bettinger.processmgmt.common.application.LocationService;
import de.bettinger.processmgmt.common.domain.Address;
import de.bettinger.processmgmt.common.infrastructure.persistence.LocationEntity;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/locations")
public class LocationsController {

	private final LocationService locationService;

	public LocationsController(LocationService locationService) {
		this.locationService = locationService;
	}

	@PostMapping
	public ResponseEntity<CreateLocationResponse> createLocation(
			@RequestHeader(DevAuthFilter.TENANT_HEADER) String tenantId,
			@Valid @RequestBody CreateLocationRequest request
	) {
		Address address = toAddress(request.address());
		LocationEntity entity = locationService.createLocation(tenantId, request.label(), address);
		return ResponseEntity.status(HttpStatus.CREATED).body(new CreateLocationResponse(entity.getId()));
	}

	@GetMapping
	public LocationsResponse listLocations(@RequestHeader(DevAuthFilter.TENANT_HEADER) String tenantId) {
		List<LocationResponse> items = locationService.listLocations(tenantId).stream()
				.map(this::toResponse)
				.toList();
		return new LocationsResponse(items);
	}

	@GetMapping("/{locationId}")
	public LocationResponse getLocation(
			@RequestHeader(DevAuthFilter.TENANT_HEADER) String tenantId,
			@PathVariable UUID locationId
	) {
		LocationEntity entity = locationService.getLocation(tenantId, locationId);
		return toResponse(entity);
	}

	private Address toAddress(AddressRequest request) {
		return new Address(
				request.street(),
				request.houseNumber(),
				request.postalCode(),
				request.city(),
				request.country()
		);
	}

	private LocationResponse toResponse(LocationEntity entity) {
		AddressResponse address = new AddressResponse(
				entity.getAddress().getStreet(),
				entity.getAddress().getHouseNumber(),
				entity.getAddress().getPostalCode(),
				entity.getAddress().getCity(),
				entity.getAddress().getCountry()
		);
		return new LocationResponse(entity.getId(), entity.getLabel(), address);
	}
}
